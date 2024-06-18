import React, { useMemo, useContext, useState, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { getPageInstance } from '@common/utils';
import { PRE_EDU_PATH } from '@common/constants';
import { UICardContext } from '@plugin/stores/UICardContext';
import { EAnswerStatus } from '@plugin/components/ChatWrapper';
// import { UICardContext } from '@plugin/stores/UICardContext';
import InfoExtractionBlock from '../InfoExtractionBlock';
import StudentDataList from './components/StudentDataList';
import './index.less';

export interface IObservationRecordProps {
  detail?: any;
  showBtn: boolean;
  analyzeStatus?: number;
  showMore?: boolean;
}

const ObservationRecord: React.FC<IObservationRecordProps> = ({
  detail,
  showBtn,
  analyzeStatus = 0,
  showMore = true,
}) => {
  const [visilbleNum, setVisilbleNum] = useState('');
  const [backUrl, setBackUrl] = useState('');

  const { chatItem, changeCurrentPlayContent, globalAnswerStatus } = useContext(UICardContext) || {};
  const data = detail || JSON.parse(chatItem?.agentResponse || '{}')?.data || {};
  const chatContent = chatItem?.chatContent || data.content;
  const { tag, uniqueId } = chatItem || {};
  // console.log('data', data, uniqueId, chatItem);

  useEffect(() => {
    changeCurrentPlayContent?.('AI智能提取信息如下');
  }, []);

  useDidShow(() => {
    const currentPage = getPageInstance();
    console.log('currentPage', currentPage.data);
    if (currentPage.data.from === 'archive_observation' && currentPage.data.uniqueId === uniqueId) {
      setBackUrl(currentPage.data.from);
    }
  });
  const { suggest, analyse } = useMemo(() => {
    const contentSplit = chatContent?.split('## 跟进措施：');
    return {
      suggest: contentSplit[1],
      analyse: contentSplit[0].replace('## 观察分析：', ''),
    };
  }, [chatContent]);

  const {
    behavior = [],
    extractInfo,
    student,
  } = useMemo(() => {
    const { content, extractInfo, student } = data;
    let { behavior = [] } = extractInfo;
    behavior = behavior?.filter((item) => item?.sectorList?.length);
    return {
      behavior,
      content,
      extractInfo,
      student,
    };
  }, [data]);

  const navigatorDetail = () => {
    if (tag === '已归档' || backUrl === 'archive_observation') {
      return;
    }
    const currentPage = getPageInstance();
    const { detailData = [] } = data;
    let top3IdList: number[] = [];
    detailData?.forEach((item) => {
      const { top3List } = item;
      top3List?.forEach((topItem) => {
        top3IdList.push(topItem?.observeId);
      });
    });
    const correlateId = [...new Set(top3IdList)].join(',');
    // console.log('uniqueId', chatItem?.uniqueId);
    currentPage.setData({
      observationdetail: { ...data, correlateId },
      uniqueId: chatItem?.uniqueId,
    });
    // console.log({ data, chatItem });
    // console.log('correlateId', correlateId);
    Taro.navigateTo({ url: `${PRE_EDU_PATH}/archive_observation/index?correlateId=${correlateId}` });
  };

  const chooseLnum = (index: number, index2: number) => {
    // console.log({ index, index2 })
    setVisilbleNum(`${index}-${index2}`);
  };
  // const { chatItem, globalAnswerStatus } = useContext(UICardContext) || {};
  return (
    <View className="observation-record" onClick={() => setVisilbleNum('')}>
      <View className="observation-title mb32">AI智能提取信息如下：</View>
      <InfoExtractionBlock students={student} extractInfo={extractInfo} showMore={showMore} />
      {behavior?.length ? (
        <>
          <View className="observation-title mt28">表现行为</View>
          <StudentDataList dataList={behavior || []} visilbleNum={visilbleNum} chooseLnum={chooseLnum} />
        </>
      ) : null}
      {analyse && !analyzeStatus ? (
        <>
          <View className="observation-title mt28">观察分析</View>
          <View className="observation-text ">
            <Text>{analyse}</Text>
          </View>
        </>
      ) : null}
      {suggest && !analyzeStatus ? (
        <>
          <View className="observation-title mt28">跟进措施</View>
          <View className="observation-text mt12">
            <Text>{suggest}</Text>
          </View>
        </>
      ) : null}

      {showBtn && globalAnswerStatus === EAnswerStatus.UN_ANSWER ? (
        <View
          onClick={navigatorDetail}
          className={`${tag === '已归档' || backUrl === 'archive_observation' ? 'hadlesubmit2' : ''} hadlesubmit mt24`}
        >
          {tag === '已归档' || backUrl === 'archive_observation' ? '已归档' : '归档观察记录'}
        </View>
      ) : null}
    </View>
  );
};

export default ObservationRecord;
