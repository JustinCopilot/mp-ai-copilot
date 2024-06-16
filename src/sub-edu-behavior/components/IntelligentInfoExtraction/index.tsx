import React, { useState, useContext, useEffect, useRef } from 'react';
import { View, Button, RichText } from '@tarojs/components';
import MarkdownIt from 'markdown-it';
import { UICardContext } from '@plugin/stores/UICardContext';
import { IAgentResponseData } from '@sub-edu-behavior/request/type';
import Taro, { useDidShow } from '@tarojs/taro';
import { PRE_EDU_PATH } from '@plugin/constants';
import { EPageFrom } from '@plugin/types';
import { getPageInstance } from '@common/utils';
import { setTagApi } from '@plugin/request/chat';
import { EChatItemTag } from '@plugin/request/chat/type';
import { EAnswerStatus } from '@plugin/components/ChatWrapper';
import InfoExtractionBlock from '../InfoExtractionBlock';
import './index.less';

export interface IIntelligentInfoExtractionProps {
  data: IAgentResponseData;
}

const mdParser = new MarkdownIt();

const IntelligentInfoExtraction: React.FC<IIntelligentInfoExtractionProps> = ({ data }) => {
  const [analysisContentVisible, setAnalysisContentVisible] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const currentDataId = useRef<string>();

  const {
    globalAnswerStatus,
    isGlobalLastAnswer,
    changeCurrentAnswerOperater,
    changeCurrentChatItemTag,
    putChat,
    chatItem,
    changeCurrentPlayContent,
  } = useContext(UICardContext) || {};

  const handleAnalysis = () => {
    setAnalysisLoading(true);
    setTimeout(() => {
      setAnalysisContentVisible(true);
      setAnalysisLoading(false);
    }, 1000);
  };
  const supplementHandle = () => {
    if (globalAnswerStatus !== EAnswerStatus.UN_ANSWER) {
      return;
    }
    const currentPage = getPageInstance();
    currentPage.setData({
      observationdetail: data,
    });
    currentDataId.current = chatItem?.uniqueId;
    Taro.navigateTo({ url: `${PRE_EDU_PATH}/information_supplement/index` });
  };
  useDidShow(() => {
    const currentPage = getPageInstance();
    if (currentPage.data.from === EPageFrom.EDIT_OBSERVATION) {
      if (currentDataId.current) {
        setTagApi({ dataId: currentDataId.current, tag: EChatItemTag.EDU_INFORMATION_SUPPLEMENTED });
        changeCurrentChatItemTag?.(EChatItemTag.EDU_INFORMATION_SUPPLEMENTED);
      }
      if (currentPage.data.observationdetail) {
        const observationdetail = currentPage.data.observationdetail;
        putChat?.(
          {
            query: '补充信息',
            userParam: observationdetail,
          },
          {
            saveTag: EChatItemTag.EDU_INFORMATION_SUPPLEMENT_DATA,
            banEdit: true,
          },
        );
        currentPage.setData({
          observationdetail: null,
          from: null,
        });
      }
    }
  });

  useEffect(() => {
    if (isGlobalLastAnswer) {
      changeCurrentAnswerOperater?.({
        hideReGenerator: !analysisContentVisible,
      });
    }
  }, [analysisContentVisible, isGlobalLastAnswer]);

  useEffect(() => {
    changeCurrentPlayContent?.('诶哎智能提取信息如下');
  }, []);

  return (
    <View className="intelligent-info-extraction">
      <View className="title">
        <View>AI智能提取信息如下：</View>
        {chatItem?.tag ? (
          chatItem.tag === EChatItemTag.EDU_INFORMATION_SUPPLEMENTED && (
            <View className="disable-supplement">信息已修改</View>
          )
        ) : (
          <View className="right">
            <View className="icon" />
            <View onClick={supplementHandle}>信息补充</View>
          </View>
        )}
      </View>
      <InfoExtractionBlock extractInfo={data.extractInfo} students={data.student} showMore />
      {!analysisContentVisible && (
        <Button loading={analysisLoading} className="analysis-btn" onClick={handleAnalysis}>
          智能分析
        </Button>
      )}
      {analysisContentVisible && (
        <View className="content">
          <RichText nodes={mdParser.render(`${data.content?.replace(/##/g, '####')}`)} />
        </View>
      )}
    </View>
  );
};

export default IntelligentInfoExtraction;
