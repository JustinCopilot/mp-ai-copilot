import React, { useState, useContext, useEffect } from 'react';
import { UICardContext } from '@plugin/stores/UICardContext';
import { View, Image } from '@tarojs/components';
import dayjs from 'dayjs';
import { PRE_PLUGIN_PATH } from '@plugin/constants';
import { ECheckStatus } from '@plugin/components/ChatWrapper';
import type { IAgentResponseData } from '@edu/request/type';
import { /* getResource, */ getRandomNotesListApi, getSituationLabelList } from '@edu/request';
import { ChooseGradeModal /* , SelectLabelPicker, Option */ } from '@edu/components';
import Taro from '@tarojs/taro';
import { useRequest } from 'ahooks';
import './index.less';

import type {
  IObserveListRes,
  IObservationGradeInfo,
  IObservationSituationInfo,
  IGetRandomNotesListRes,
} from '../../request/type';
import ChooseModal from '../GenerateObservationRecords/components/ChooseModal';
import ChooseObservationSituationModal from '../ChooseObservationSituationModal';

// import ChooseGradeModal from '../ChooseGradeModal';

export interface IObservationPointsProps {
  data: IAgentResponseData;
}

const ObservationPoints: React.FC<IObservationPointsProps> = ({ data: { tag } }) => {
  const { putChat, isGlobalLastAnswer, globalCheckStatus, changeCurrentPlayContent } = useContext(UICardContext) || {};
  const [loadMore, setLoadMore] = useState(false);
  const [jotdownVisible, setJotdownVisible] = useState<boolean>(false);
  const [gradeVisible, setGradeVisible] = useState<boolean>(false);
  const [observeSituationVisible, setObserveSituationVisible] = useState<boolean>(false);

  const [dataList, setDataList] = useState<IGetRandomNotesListRes[]>([]);
  const [tabsIndex, setTabsIndex] = useState<number>(2);
  const [step, setStep] = useState(0);
  // const [observeOptions, setObserveOptions] = useState<Option[]>([]);
  // const [observeSituation, setObserveSituation] = useState<Option['value'][]>([]);

  // const { data: dataList = [], run } = useRequest(() => getRandomNotesListApi({}), { manual: true });
  const { data: situationList = [], run: runSituation } = useRequest(() => getSituationLabelList(), { manual: true });
  const [firstStepChooseData, setFirstStepChooseData] = useState<IObserveListRes[]>([]);
  // 真实渲染数据
  const [chooseStepData, setChooseStepData] = useState<IObserveListRes[]>([]);
  const [jotdownText, setJotdownText] = useState<string>('');
  const [gradeInfo, setGradeInfo] = useState<IObservationGradeInfo>({
    gradeName: '',
    gradeId: 0,
  });
  const [situationInfo, setSituationInfo] = useState<IObservationSituationInfo>({
    situationName: '',
    situationId: 0,
  });

  const disabledStatus = !isGlobalLastAnswer || globalCheckStatus === ECheckStatus.NEW_SESSION;

  useEffect(() => {
    changeCurrentPlayContent?.(tag === 'BehaviorKeyPoint' ? '请完善观察要点指导要求' : '请完善观察分析建议要求');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // useEffect(() => {
  //   getOptions();
  // }, []);

  // const getOptions = async () => {
  //   const data = (await getSituationLabelList()) || {};
  //   const options =
  //     data?.map(({ typeId, typeName, situationList }) => ({
  //       label: typeName,
  //       value: typeId,
  //       children:
  //         situationList?.map(({ situationId: value, situationName: label }) => ({
  //           value,
  //           label,
  //           parentLabel: typeName,
  //           parentValue: typeId,
  //         })) || [],
  //     })) || [];
  //   setObserveOptions(options);
  // };
  const getDataList = (source?: number | undefined, change?: boolean | undefined) => {
    const _source = source || tabsIndex || 2;
    let flag = false;
    if (flag) return;
    flag = true;
    const data = dataList?.length
      ? {
          dateTime: dayjs(dataList[dataList.length - 1].observeDate)
            .subtract(1, 'day')
            .format('YYYY-MM-DD'),
          source: _source === 1 ? 1 : 2,
        }
      : { source: _source === 1 ? 1 : 2 };
    const param = change ? { source: _source === 1 ? 1 : 2 } : data;
    getRandomNotesListApi(param).then((res) => {
      // console.log(
      //   'res',
      //   res,
      //   dataList?.length
      //     ? dayjs(dataList[dataList.length - 1].observeDate)
      //         .subtract(1, 'day')
      //         .format('YYYY-MM-DD')
      //     : 1,
      // );
      flag = false;
      setLoadMore(res?.length ? false : true);
      console.log(dataList, '===========dataList===========>');
      if (param?.dateTime) {
        setDataList([...dataList, ...res]);
      } else {
        setDataList([...res]);
      }
    });
  };

  const onTabsChange = (index: number) => {
    setDataList([]);
    setTabsIndex(index);
  };

  useEffect(() => {
    if (jotdownVisible) {
      setDataList([]);
      getDataList(tabsIndex, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabsIndex]);

  const goDetail = (record: any) => {
    Taro.navigateTo({ url: `${PRE_PLUGIN_PATH}/observation_detail?observeId=${record?.observeId}` });
  };

  const chooseItem = (record: IObserveListRes) => {
    console.log(
      'chooseItem',
      record,
      firstStepChooseData.some((item) => item.observeId === record.observeId),
    );
    setFirstStepChooseData([record]);

    // const { orgName, observeDate } = record;
    // const sourceText = source === 1 ? '幼儿观察记录' : '幼儿随手记';
    // const jotdownText = `${orgName}${sourceText}  ${observeDate}`;
    // setJotdownText(jotdownText);

    // setJotdownVisible(false);
  };

  const handleCloseSituationModal = () => {
    setObserveSituationVisible(false);
  };

  const handleSelectSituation = (situationInfo: IObservationSituationInfo) => {
    setSituationInfo(situationInfo);
    // setSituationList(situationInfo)
    setObserveSituationVisible(false);
  };

  // 确定
  const handleConfrim = () => {
    const { gradeName } = gradeInfo;
    const userParam = {
      tag,
      grade: gradeName,
      situationList: [situationInfo?.situationName],
      observeList: firstStepChooseData,
    };

    // 校验
    if (!situationInfo?.situationName) {
      Taro.showToast({
        title: '请选择观察情境',
        icon: 'none',
        duration: 1500,
      });
      return;
    }
    if (!gradeName) {
      Taro.showToast({
        title: '请选择幼儿年级',
        icon: 'none',
        duration: 1500,
      });
      return;
    }
    putChat?.({ userParam }, { needPutAnsker: false });
  };

  // 筛选幼儿接入
  // const filterObserveList = () => {
  //   if (resourceList?.length) {
  //     setStep(tag === 'BehaviorAnalysisSuggestion' ? 2 : 1);
  //   } else {
  //     getResourceList();
  //   }
  // };

  // const getResourceList = () => {
  //   getResource().then((res) => {
  //     console.log('getResourceList', res);
  //     const { gradeList = [] } = res;
  //     let classResourceList: any[] = [];
  //     gradeList?.forEach((item) => {
  //       const { classList } = item;
  //       const newClassList = classList?.length ? classList : [];
  //       classResourceList.push(...newClassList);
  //     });
  //     if (!classResourceList?.length) {
  //       Taro.showToast({
  //         title: '暂无可选项',
  //       });
  //       return;
  //     }
  //     console.log('classResourceList', classResourceList);
  //     setFilterChooseStudentNum(classResourceList?.[0]?.classId);
  //     setFilterChooseStudentList(classResourceList?.[0]?.studentList || []);
  //     setResourceList(classResourceList?.length ? classResourceList : []);
  //     setStep(copyFirstStepChooseData?.length ? 2 : 1);
  //   });
  // };

  return (
    <View className={disabledStatus ? 'observation-points disabled' : 'observation-points'}>
      <View className="observation-title">{`请完善【${tag === 'BehaviorKeyPoint' ? '观察要点指导' : '观察分析建议'}】要求：`}</View>
      <View className="observation-list">
        <View className="observation-item">
          <View className="observation-label">观察内容</View>
          <View
            className="observation-value"
            onClick={() => {
              setJotdownVisible(true);
              getDataList(tabsIndex, !!chooseStepData?.length);
              if (chooseStepData?.length) {
                setDataList([]);
                setTabsIndex(firstStepChooseData[0]?.source || 2);
                setStep(firstStepChooseData[0]?.source === 1 ? 1 : 0);
                setFirstStepChooseData([...chooseStepData]);
              } else {
                setFirstStepChooseData([]);
              }
            }}
          >
            <View className={firstStepChooseData?.length ? 'text ellipsis active' : 'text'}>
              {chooseStepData?.length ? jotdownText : '点击选择随手记'}
            </View>
            <Image src="https://senior.cos.clife.cn/xiao-c/more-right@2x.png" className="observation-arrow" />
          </View>
        </View>
        <View className="observation-item">
          <View className="observation-label">观察情境</View>
          {/* <SelectLabelPicker
            title="选择观察情境"
            type="single"
            options={observeOptions}
            value={observeSituation}
            onChange={(val, rows) => {
              const { label, value } = rows[0] || {};
              setObserveSituation(val);
              setSituationInfo({ situationName: label, situationId: value });
            }}
          > */}

          <View
            className="observation-value ellipsis"
            onClick={() => {
              setObserveSituationVisible(true);
              !situationList?.length && runSituation();
            }}
          >
            <View className={situationInfo?.situationName ? 'text active' : 'text'}>
              {situationInfo?.situationName || '点击选择情境'}
            </View>
            <Image src="https://senior.cos.clife.cn/xiao-c/more-right@2x.png" className="observation-arrow" />
          </View>
          {/* </SelectLabelPicker> */}
        </View>
        <View className="observation-item">
          <View className="observation-label">幼儿年级</View>
          <View
            className="observation-value"
            onClick={() => {
              setGradeVisible(true);
            }}
          >
            <View className={gradeInfo?.gradeName ? 'text active' : 'text'}>
              {gradeInfo?.gradeName || '点击选择年级'}
            </View>
            <Image src="https://senior.cos.clife.cn/xiao-c/more-right@2x.png" className="observation-arrow" />
          </View>
        </View>
      </View>
      {!disabledStatus && (
        <View className="observation-btn" onClick={handleConfrim}>
          确定
        </View>
      )}

      {jotdownVisible && (
        <ChooseModal
          step={tag === 'BehaviorAnalysisSuggestion' ? step : 0}
          show={jotdownVisible}
          dataList={dataList}
          firstText="确定"
          secondText="取消"
          goDetail={goDetail}
          loadMore={loadMore}
          showCancel={true}
          getDataList={getDataList}
          changeVisible={() => setJotdownVisible(false)}
          showRecordList={tag === 'BehaviorAnalysisSuggestion'}
          onTabsChange={onTabsChange}
          tabsIndex={tabsIndex}
          swiperChooseStep={(val) => setTabsIndex(val === 1 ? 1 : 2)}
          firstClick={() => {
            if (!firstStepChooseData?.length) {
              Taro.showToast({
                title: '请选择随手记',
                icon: 'none',
                duration: 1500,
              });
              return;
            }

            const { orgName, observeDate, source } = firstStepChooseData[0];
            const sourceText = source === 1 ? '幼儿观察记录' : '幼儿随手记';
            const jotdownText = `${orgName}${sourceText}  ${observeDate}`;
            setJotdownText(jotdownText);

            setJotdownVisible(false);
            setChooseStepData([...firstStepChooseData]);
          }}
          firstStepChooseData={firstStepChooseData}
          chooseItem={chooseItem}
          // filterObserveList={filterObserveList}
        />
      )}

      {gradeVisible && (
        <ChooseGradeModal
          show={gradeVisible}
          handleClose={() => setGradeVisible(false)}
          handleSelect={(type: IObservationGradeInfo) => {
            setGradeVisible(false);
            setGradeInfo(type);
          }}
        />
      )}

      {observeSituationVisible && (
        <ChooseObservationSituationModal
          handleClose={handleCloseSituationModal}
          show={observeSituationVisible}
          handleSelect={handleSelectSituation}
          situationInfo={situationInfo}
          dataList={situationList}
          // situationList={situationList}
          type="radio"
        />
      )}
    </View>
  );
};

export default ObservationPoints;
