import React, { useState, useContext, useEffect, useRef } from 'react';
import { UICardContext } from '@plugin/stores/UICardContext';
import { View, Image } from '@tarojs/components';
// import dayjs from 'dayjs';
import cloneDeep from 'lodash/cloneDeep';
import { PRE_EDU_PATH } from '@plugin/constants';
import { ECheckStatus } from '@plugin/components/ChatWrapper';
import type { IAgentResponseData } from '@sub-edu-behavior/request/type';
import { getResource, /* getRandomNotesListApi, */ getNaviListApi, getSituationLabelList } from '@sub-edu-behavior/request';
import { ChooseGradeModal /* , SelectLabelPicker, Option */ } from '@sub-edu-behavior/components';
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
  // const [loadMore, setLoadMore] = useState(false);
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

  const [filterChooseStuentNum, setFilterChooseStudentNum] = useState<number>(0); // 选中第一列的学生id
  const [filterChooseStuentList, setFilterChooseStudentList] = useState<any[]>([]);
  const [resourceList, setResourceList] = useState<any[]>([]); // 第一列要渲染的数据
  const [thirdStepChooseData, setThirdStepChooseData] = useState<number[]>([]);
  const [copyThirdStepChooseData, setCopyThirdStepChooseData] = useState<number[]>([]);
  const thirdStepChooseDataRef = useRef<number[] | null>(null);
  // const [copyFirstStepChooseData, setCopyFirstStepChooseData] = useState<IObserveListRes[]>([]); // 第一步过程中的拷贝数据可能被用户操作变更
  // const [secondStepChooseData, setSecondStepChooseData] = useState<IStudentListRes[]>([]);
  // const [copySecondStepChooseData, setCopySecondStepChooseData] = useState<IStudentListRes[]>([]);

  const [pageIndex, setPageIndex] = useState<number | string>(0); // 列表页码
  const [totalRows, setTotalRows] = useState<number>(0);
  const [scrollTop, setScrollTop] = useState<number>(0);
  const [count, setCount] = useState(0);

  const dataListRef = useRef<IGetRandomNotesListRes[] | null>(null);

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
  const getDataList = (source?: number | undefined, pageIndex?: number | string) => {
    const _source = source || tabsIndex || 2;
    let flag = false;
    if (flag) return;
    flag = true;
    // const data = dataList?.length
    //   ? {
    //       dateTime: dayjs(dataList[dataList.length - 1].observeDate)
    //         .subtract(1, 'day')
    //         .format('YYYY-MM-DD'),
    //       source: _source === 1 ? 1 : 2,
    //     }
    //   : { source: _source === 1 ? 1 : 2 };
    const param = { source: _source === 1 ? 1 : 2 };
    const studentParam = thirdStepChooseDataRef?.current?.length
      ? { studentId: thirdStepChooseDataRef?.current.join(',') }
      : {};
    getNaviListApi({ ...param, ...studentParam, pageIndex: Number(pageIndex) || 1, pageRows: 10 }).then((res) => {
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
      const { list = [], pager = {} } = res;
      const { totalRows } = pager;
      let newResourceList = cloneDeep(dataList);

      list.forEach((item) => {
        const findIndex = newResourceList.findIndex((resourceItem) => resourceItem.observeDate === item?.observeDate);
        if (findIndex !== -1) {
          newResourceList[findIndex].observeList.push(item);
        } else {
          newResourceList.push({ observeDate: item?.observeDate, observeList: [item] });
        }
      });
      setDataList(() => {
        dataListRef.current = newResourceList;
        return dataListRef.current;
      });
      setDataList([...newResourceList]);
      setTotalRows(() => totalRows);

      // if (param?.dateTime) {
      //   setDataList([...dataList, ...res]);
      // } else {
      //   setDataList([...res]);
      // }
    });
  };

  const onTabsChange = (index: number) => {
    // setDataList([]);
    setTabsIndex(index);
    setStep(index === 2 ? 0 : 1);
    // 切换的时候 清空筛选信息
    setThirdStepChooseData(() => {
      thirdStepChooseDataRef.current = [];
      return thirdStepChooseDataRef.current;
    });
    setDataList(() => {
      dataListRef.current = [];
      return dataListRef.current;
    });

    setFilterChooseStudentNum(resourceList?.[0]?.classId);
    setFilterChooseStudentList(resourceList?.[0]?.studentList || []);

    // 清空选中学生列表
    setCopyThirdStepChooseData([]);
    setPageIndex(1);
    setCount(() => count + 1);
  };

  // useEffect(() => {
  //   if (jotdownVisible) {
  //     setDataList([]);
  //     getDataList(tabsIndex, 1);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [tabsIndex]);

  const goDetail = (record: any) => {
    console.log('record', record);
    const router = record.source === 2 ? 'jot_down_detail' : 'observation_detail';
    Taro.navigateTo({ url: `${PRE_EDU_PATH}/${router}/index?observeId=${record?.observeId}&hideBtn=true` });
  };

  const chooseItem = (record: IObserveListRes) => {
    console.log(
      'chooseItem',
      record,
      firstStepChooseData.some((item) => item.observeId === record.observeId),
    );
    // 单选 可以取消反选
    const newList = firstStepChooseData.find((item) => item.observeId === record.observeId) ? [] : [record];
    setFirstStepChooseData([...newList]);

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

  const onChangeResoureceNum = (record: any) => {
    console.log('onChangeResoureceNum', record);
    setFilterChooseStudentNum(record?.classId);
    setFilterChooseStudentList(record?.studentList || []);
  };

  const filterObserveList = () => {
    console.log(resourceList, '-------resourceList--------->');

    if (resourceList?.length) {
      const step = tag === 'BehaviorAnalysisSuggestion' ? 2 : 1;
      setStep(step);
    } else {
      getResourceList();
    }
  };

  const getResourceList = () => {
    getResource().then((res) => {
      console.log('getResourceList', res);
      const { gradeList = [] } = res;
      let classResourceList: any[] = [];
      gradeList?.forEach((item) => {
        const { classList } = item;
        const newClassList = classList?.length ? classList : [];
        classResourceList.push(...newClassList);
      });
      if (!classResourceList?.length) {
        Taro.showToast({
          title: '暂无可选项',
        });
        return;
      }
      console.log('classResourceList', classResourceList);
      setFilterChooseStudentNum(classResourceList?.[0]?.classId);
      setFilterChooseStudentList(classResourceList?.[0]?.studentList || []);
      setResourceList(classResourceList?.length ? classResourceList : []);
      const step = tag === 'BehaviorAnalysisSuggestion' ? 2 : 1;
      setStep(step);
      console.log(step, '-----------xx-x>');
    });
  };

  const sureStudentListBtn = () => {
    console.log('点击了sure--btn----->');

    setThirdStepChooseData(() => {
      thirdStepChooseDataRef.current = copyThirdStepChooseData;
      return thirdStepChooseDataRef.current;
    });
    setFirstStepChooseData(() => []);
    // setCopyFirstStepChooseData(() => []);
    // setSecondStepChooseData(() => []);
    // setCopySecondStepChooseData(() => []);
    setDataList(() => {
      dataListRef.current = [];
      return dataListRef.current;
    });

    // console.log(tabsIndex, '-=========tabsIndex======.');
    setScrollTop(() => 0);
    const step = tabsIndex === 1 ? 1 : 0;
    setPageIndex(1);
    setCount(() => count + 1);
    setStep(tag === 'BehaviorAnalysisSuggestion' ? step : 0);
  };

  useEffect(() => {
    if (pageIndex) {
      getDataList(tabsIndex, pageIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, count]);

  // 侧滑切换
  const swiperChooseStep = (val: number) => {
    // setTabsIndex(val === 1 ? 1 : 2);
    setStep(val);
  };

  useEffect(() => {
    if (!jotdownVisible) {
      setCopyThirdStepChooseData([]);
      setThirdStepChooseData(() => {
        thirdStepChooseDataRef.current = [];
        return thirdStepChooseDataRef.current;
      });
    }
  }, [jotdownVisible]);

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
              setPageIndex(1);
              setCount(() => count + 1);
              setScrollTop(0);
              // setCopyThirdStepChooseData([]);
              if (chooseStepData?.length) {
                setDataList([]);
                setTabsIndex(firstStepChooseData[0]?.source || 2);
                const step = firstStepChooseData[0]?.source === 1 ? 1 : 0;
                setStep(tag === 'BehaviorAnalysisSuggestion' ? step : 0);
                setFirstStepChooseData([...chooseStepData]);
              } else {
                setFirstStepChooseData([]);
                setStep(0);
              }
            }}
          >
            <View className={chooseStepData?.length ? 'text ellipsis active' : 'text ellipsis'}>
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
          step={step}
          show={jotdownVisible}
          dataList={dataList}
          firstText="确定"
          secondText="取消"
          goDetail={goDetail}
          firstStepTotalRows={totalRows}
          currentPageAddOne={() => {
            setPageIndex(() => Number(pageIndex) + 1);
          }}
          setScrollTop={(val) => {
            setScrollTop(val);
          }}
          showCancel={true}
          changeVisible={() => {
            setJotdownVisible(false);
          }}
          showRecordList={tag === 'BehaviorAnalysisSuggestion'}
          onTabsChange={onTabsChange}
          tabsIndex={tabsIndex}
          swiperChooseStep={(val) => swiperChooseStep(val)}
          firstClick={() => {
            // if (!firstStepChooseData?.length) {
            //   Taro.showToast({
            //     title: '请选择随手记',
            //     icon: 'none',
            //     duration: 1500,
            //   });
            //   return;
            // }
            const { orgName, observeDate, source } = firstStepChooseData[0] || {};
            const sourceText = source === 1 ? '幼儿观察记录' : '幼儿随手记';
            const jotdownText = `${orgName}${sourceText}  ${observeDate}`;
            setJotdownText(jotdownText);

            setJotdownVisible(false);
            setChooseStepData([...firstStepChooseData]);
          }}
          firstStepChooseData={firstStepChooseData}
          chooseItem={chooseItem}
          onChangeResoureceNum={(val) => onChangeResoureceNum(val)}
          resourceList={resourceList}
          filterObserveList={filterObserveList}
          chooseResourceList={filterChooseStuentList}
          chooseResourceNum={filterChooseStuentNum}
          copyThirdStepChooseData={copyThirdStepChooseData}
          chooseThirdStepData={(val) => {
            const newList = copyThirdStepChooseData.includes(val)
              ? copyThirdStepChooseData.filter((item) => item !== val)
              : [...copyThirdStepChooseData, val];
            console.log('newlist', newList);
            setCopyThirdStepChooseData(newList);
          }}
          reset={() => setCopyThirdStepChooseData([])}
          sureStudentListBtn={sureStudentListBtn}
          thirdStepChooseData={thirdStepChooseData}
          scrollTop={scrollTop}
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
          type="radio"
        />
      )}
    </View>
  );
};
export default ObservationPoints;
