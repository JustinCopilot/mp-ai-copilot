/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useState, useRef, useEffect } from 'react';
// import { useRequest } from 'ahooks';
import dayjs from 'dayjs';

import Taro from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import { UICardContext } from '@plugin/stores/UICardContext';
import { PRE_EDU_PATH } from '@plugin/constants';
import { ECheckStatus } from '@plugin/components/ChatWrapper';
import { getResource, getRandomNotesListApi } from '@edu/request';

import type { IObserveListRes, IStudentListRes, IGetRandomNotesListRes } from '../../request/type';
import ChooseModal from './components/ChooseModal';
// import { UICardContext } from '../../../../plugin/stores/UICardContext';
import './index.less';

export interface IGenerateObservationRecordsProps {}

const GenerateObservationRecords: React.FC<IGenerateObservationRecordsProps> = () => {
  const { putChat, isGlobalLastAnswer, globalCheckStatus, changeCurrentPlayContent } = useContext(UICardContext) || {};
  const [visible, setVisible] = useState(false);
  const [loadMore, setLoadMore] = useState(false);
  const [step, setStep] = useState<number>(0);
  const [filterChooseStuentNum, setFilterChooseStudentNum] = useState<number>(0); // 选中第一列的学生id
  const [filterChooseStuentList, setFilterChooseStudentList] = useState<any[]>([]);
  const [resourceList, setResourceList] = useState<any[]>([]); // 第一列要渲染的数据

  // const { data: dataList = [], run } = useRequest(() => getRandomNotesListApi({}), { manual: true });
  // const { data: resourceList, run: getResourceList } = useRequest(() => getResource(), { manual: true });
  // console.log('resourceList', resourceList);
  const [dataList, setDataList] = useState<IGetRandomNotesListRes[]>([]);
  const [firstStepChooseData, setFirstStepChooseData] = useState<IObserveListRes[]>([]); // 第一步实际数据
  const [copyFirstStepChooseData, setCopyFirstStepChooseData] = useState<IObserveListRes[]>([]); // 第一步过程中的拷贝数据可能被用户操作变更
  const [secondStepChooseData, setSecondStepChooseData] = useState<IStudentListRes[]>([]);
  const [copySecondStepChooseData, setCopySecondStepChooseData] = useState<IStudentListRes[]>([]);

  const [thirdStepChooseData, setThirdStepChooseData] = useState<number[]>([]);
  const [copyThirdStepChooseData, setCopyThirdStepChooseData] = useState<number[]>([]);

  const dataListRef = useRef<IGetRandomNotesListRes[] | null>(null);
  const thirdStepChooseDataRef = useRef<number[] | null>(null);

  const disabledStatus = !isGlobalLastAnswer || globalCheckStatus === ECheckStatus.NEW_SESSION;

  useEffect(() => {
    changeCurrentPlayContent?.('选择【随手记】生成观察记录');
  }, []);

  const chooseItem = (record: IObserveListRes) => {
    if (copyFirstStepChooseData.some((item) => item.observeId === record.observeId)) {
      const newList = copyFirstStepChooseData.filter((item) => item.observeId !== record.observeId);
      setCopyFirstStepChooseData(newList);
      setCopySecondStepChooseData([]);
    } else if (copyFirstStepChooseData?.length > 2) {
      Taro.showToast({
        title: '最多可选3个',
        icon: 'none',
        duration: 1500,
      });
      return;
    } else {
      setCopySecondStepChooseData([]);
      setCopyFirstStepChooseData([record, ...copyFirstStepChooseData]);
    }
  };

  const getDataList = () => {
    let flag = false;
    if (flag) return;
    flag = true;
    // console.log({
    //   thirdStepChooseData,
    //   dataList,
    //   dataListRef,
    //   'dataListRef.current': dataListRef.current,
    //   thirdStepChooseDataRef,
    //   thirdStepChooseDataRefCurrent: thirdStepChooseDataRef.current,
    // });
    const studentParam = thirdStepChooseDataRef?.current?.length
      ? { studentId: thirdStepChooseDataRef?.current.join(',') }
      : {};
    const param = dataListRef?.current?.length
      ? {
          dateTime: dayjs(dataListRef?.current[dataListRef?.current.length - 1].observeDate)
            .subtract(1, 'day')
            .format('YYYY-MM-DD'),
        }
      : {};
    getRandomNotesListApi({ ...param, ...studentParam }).then((res) => {
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
      setDataList(() => {
        const newArray = dataListRef.current?.length ? dataListRef.current : [];
        dataListRef.current = [...newArray, ...res];
        return dataListRef.current;
      });
    });
  };

  const setModalVisible = (val: boolean) => {
    setVisible(val);
  };

  const submit = () => {
    if (!copySecondStepChooseData?.length) {
      Taro.showToast({
        title: '请选择重点观察幼儿',
        icon: 'none',
        duration: 1500,
      });
      return;
    }
    console.log('提交');
    setFirstStepChooseData(copyFirstStepChooseData);
    setSecondStepChooseData(copySecondStepChooseData);
    setVisible(false);
    setStep(0);
  };

  const goDetail = (record: any) => {
    // console.log('goDetail', record);
    Taro.navigateTo({ url: `${PRE_EDU_PATH}/observation_detail/index?observeId=${record?.observeId}` });
  };

  const secondClick = (record: IStudentListRes) => {
    console.log('secondClick', record);
    if (copySecondStepChooseData.some((item) => item.studentId === record.studentId)) {
      const newList = copySecondStepChooseData.filter((item) => item.studentId !== record.studentId);
      setCopySecondStepChooseData(newList);
    } else if (copySecondStepChooseData?.length > 9) {
      Taro.showToast({
        title: '最多可选10个',
        icon: 'none',
        duration: 1500,
      });
      return;
    } else {
      setCopySecondStepChooseData([record, ...copySecondStepChooseData]);
    }
  };

  const handleSubmit = () => {
    console.log('handleSubmit');
    if (!firstStepChooseData?.length || !secondStepChooseData?.length) {
      Taro.showToast({
        title: '请选择随手记',
        icon: 'none',
        duration: 1500,
      });
      return;
    }
    const newFirstchooseData = firstStepChooseData.map((item: any) => {
      const { sectorList } = item;
      return {
        ...item,
        situationList: item?.situationList?.map((item2) => item2?.situationName) || [],
        sectorList: sectorList?.length
          ? sectorList.map((item2) => {
              return {
                area: item2?.typeName || '',
                sub: item2?.sectorList?.length ? item2?.sectorList?.map((item3) => item3?.sectorName) : [],
              };
            })
          : null,
      };
    });
    console.log({ firstStepChooseData, secondStepChooseData, newFirstchooseData });

    putChat?.(
      {
        userParam: {
          tag: 'BehaviorRecord',
          student: secondStepChooseData,
          observeList: newFirstchooseData,
        },
      },
      { needPutAnsker: false },
    );
  };

  const filterObserveList = () => {
    if (resourceList?.length) {
      setStep(copyFirstStepChooseData?.length ? 2 : 1);
    } else {
      getResourceList();
    }
  };

  const onChangeResoureceNum = (record: any) => {
    console.log('onChangeResoureceNum', record);
    setFilterChooseStudentNum(record?.classId);
    setFilterChooseStudentList(record?.studentList || []);
  };

  const sureStudentListBtn = () => {
    setThirdStepChooseData(() => {
      thirdStepChooseDataRef.current = copyThirdStepChooseData;
      return thirdStepChooseDataRef.current;
    });
    setFirstStepChooseData(() => []);
    setCopyFirstStepChooseData(() => []);
    setSecondStepChooseData(() => []);
    setCopySecondStepChooseData(() => []);
    setDataList(() => {
      dataListRef.current = [];
      return dataListRef.current;
    });

    setStep(0);
    setTimeout(() => {
      getDataList();
    }, 500);
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
      setStep(copyFirstStepChooseData?.length ? 2 : 1);
    });
  };

  return (
    <View className="generate-observation-records">
      {disabledStatus ? <View className="mask" /> : null}
      <View className="observation-title">选择【随手记】生成观察记录</View>
      <View className="observation-tip">最多可选择三个随手记</View>
      <View className="observation-btn">
        <View className="observation-btn-left">随手记</View>
        <View className="observation-btn-right">
          <View
            onClick={() => {
              console.log(123123);
              setModalVisible(true);
              // !dataList?.length && run();
              !dataList?.length && getDataList();
            }}
            className="observation-btn-right-btn"
          >
            + 选择随手记
          </View>
          {firstStepChooseData?.length && secondStepChooseData?.length ? (
            <>
              <View className="observation-btn-right-detail">
                <Image
                  src="https://senior.cos.clife.cn/xiao-c/xiaoc-1.png"
                  className="observation-btn-right-detail-icon"
                />
                <View>
                  {firstStepChooseData?.length
                    ? firstStepChooseData?.map((firstDataItem: any, index66) => {
                        return (
                          <View className="observation-btn-right-detail-text" key={firstDataItem?.observeId || index66}>
                            {`${firstDataItem?.orgName} 随手记 ${dayjs(firstDataItem?.observeDate).format('YYYY年MM月DD日')}`}
                          </View>
                        );
                      })
                    : null}
                </View>
              </View>
              <View className="observation-btn-right-detail">
                <Image
                  src="https://senior.cos.clife.cn/xiao-c/xiaoc-2.png"
                  className="observation-btn-right-detail-icon"
                />
                <Text className="observation-btn-right-detail-text">
                  {secondStepChooseData?.map((item6) => item6.studentName).join('、')}
                </Text>
              </View>
            </>
          ) : null}
        </View>
      </View>
      {!disabledStatus ? (
        <View className="observation-submit" onClick={() => handleSubmit()}>
          确定
        </View>
      ) : null}

      {visible ? (
        <ChooseModal
          step={step}
          show={visible}
          loadMore={loadMore}
          dataList={dataList}
          getDataList={getDataList}
          firstText={`下一步(${copyFirstStepChooseData?.length}/3)`}
          secondText={`下一步(${copySecondStepChooseData?.length}/10)`}
          goDetail={goDetail}
          changeVisible={setModalVisible}
          firstClick={() => {
            if (!copyFirstStepChooseData?.length) {
              Taro.showToast({
                title: '请选择随手记',
                icon: 'none',
                duration: 1500,
              });
              return;
            }
            setStep(1);
          }}
          secondClick={secondClick}
          chooseItem={chooseItem}
          submit={submit}
          swiperChooseStep={(val) => setStep(val)}
          firstStepChooseData={copyFirstStepChooseData}
          secondStepChooseData={copySecondStepChooseData}
          filterObserveList={filterObserveList}
          resourceList={resourceList}
          chooseResourceList={filterChooseStuentList}
          chooseResourceNum={filterChooseStuentNum}
          onChangeResoureceNum={(val) => onChangeResoureceNum(val)}
          thirdStepChooseData={thirdStepChooseData}
          copyThirdStepChooseData={copyThirdStepChooseData}
          chooseThirdStepData={(val) => {
            const newList = copyThirdStepChooseData.includes(val)
              ? copyThirdStepChooseData.filter((item) => item !== val)
              : [...copyThirdStepChooseData, val];
            // : [...new Set([...copyThirdStepChooseData, val])];
            console.log('newlist', newList);
            setCopyThirdStepChooseData(newList);
          }}
          reset={() => setCopyThirdStepChooseData([])}
          sureStudentListBtn={sureStudentListBtn}
        />
      ) : null}
    </View>
  );
};

export default GenerateObservationRecords;
