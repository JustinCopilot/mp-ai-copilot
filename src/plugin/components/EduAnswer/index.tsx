/* eslint-disable complexity */
import React, { useEffect, useMemo, useState, useContext } from 'react';
// import MarkdownIt from 'markdown-it';
import { View, /* RichText, */ Text } from '@tarojs/components';
import { ChatWrapperContext } from '@plugin/stores/ChatWrapperContext';
import { UICardContext } from '@plugin/stores/UICardContext';
import { EAnswerStatus } from '@plugin/components/ChatWrapper';
import DuplicateNameConfirm from '@sub-edu-behavior/components/DuplicateNameConfirm';
import ObservationRecord from '@sub-edu-behavior/components/ObservationRecord';
import ObservationPoints from '@sub-edu-behavior/components/ObservationPoints';
import GenerateObservationRecords from '@sub-edu-behavior/components/GenerateObservationRecords';
import IntelligentInfoExtraction from '@sub-edu-behavior/components/IntelligentInfoExtraction';
import { EEduBehaviorChatCard, EEduBehaviorTag, EResultType } from '@sub-edu-behavior/interface';
import type { IAgentResponseData } from '@sub-edu-behavior/request/type';
import { ECheckStatus, type IChatItem } from '../ChatWrapper';
import './index.less';

export interface IEduAnswerProps {
  chatItem: IChatItem;
}

const EduAnswer: React.FC<IEduAnswerProps> = ({ chatItem }) => {
  const [chatCard, setChatCard] = useState<EEduBehaviorChatCard | null>(null);

  const { changeCheckStatus } = useContext(ChatWrapperContext) || {};
  const { isGlobalLastAnswer, changeCurrentAnswerOperater, changeCurrentPlayContent, globalAnswerStatus } =
    useContext(UICardContext) || {};

  // const mdParser = new MarkdownIt();

  const data: IAgentResponseData = useMemo(() => {
    return JSON.parse(chatItem.agentResponse || '{}')?.data || {};
  }, [chatItem]);

  const getUserParams = (data: IAgentResponseData) => {
    const { tag, resultType, observeId, student, extractInfo } = data;
    return { tag, resultType, observeId, student, extractInfo };
  };

  useEffect(() => {
    // 卡片展示逻辑
    if (data.tag === EEduBehaviorTag.BehaviorMemo) {
      if (data.contentType && data.resultType === EResultType.TARGET) {
        setChatCard(EEduBehaviorChatCard.IntelligentInfoExtraction);
        chatItem.checkDataReferenceSign = 'jot_down_reference_detail';
        chatItem.eduBehaviorUserParams = getUserParams(data);
      }
    } else if (data.tag === EEduBehaviorTag.BehaviorRecord) {
      if (data.contentType) {
        setChatCard(EEduBehaviorChatCard.ObservationRecord);
        chatItem.checkDataReferenceSign = 'data_reference_detail';
        chatItem.eduBehaviorUserParams = getUserParams(data);
      } else {
        setChatCard(EEduBehaviorChatCard.GenerateObservationRecords);
      }
    } else if ([EEduBehaviorTag.BehaviorKeyPoint, EEduBehaviorTag.BehaviorAnalysisSuggestion].includes(data.tag)) {
      if (!data.contentType && !data.content && globalAnswerStatus === EAnswerStatus.UN_ANSWER) {
        setChatCard(EEduBehaviorChatCard.ObservationPoints);
      }
    }

    // 选择态逻辑
    if (
      ([
        EEduBehaviorTag.BehaviorRecord,
        EEduBehaviorTag.BehaviorKeyPoint,
        EEduBehaviorTag.BehaviorAnalysisSuggestion,
      ].includes(data.tag) &&
        !data.content &&
        !chatItem.chatContent.trim()) ||
      chatItem.componentInParam
    ) {
      if (isGlobalLastAnswer) {
        changeCheckStatus?.(data.contentType ? ECheckStatus.UN_CHECK : ECheckStatus.CHECKING);
        // 需要加一层判断，否则会无限循环执行
        if (!chatItem.hideReGenerator) {
          changeCurrentAnswerOperater?.({
            hideReGenerator: true,
          });
        }
      }
    }

    // 语音播报处理（后端未将内容放在 chatItem 的 chatContent 中，需单独处理）
    // chatItem.playContent !== data.content 防止渲染多次
    if (
      [EResultType.FEATURE, EResultType.NO_PERMISSION, EResultType.IRRELEVANT].includes(
        data.resultType as EResultType,
      ) &&
      data.content &&
      chatItem.playContent !== data.content
    ) {
      changeCurrentPlayContent?.(data.content);
    }
  }, [data, chatItem, globalAnswerStatus, isGlobalLastAnswer]);

  // const chatContent = mdParser.render(data.content || chatItem.chatContent || '');

  return (
    <View>
      {data.tag !== EEduBehaviorTag.BehaviorRecord && data.resultType !== EResultType.TARGET && (
        // <RichText nodes={chatContent} />
        <Text decode>{chatItem.chatContent || data.content || ''}</Text>
      )}

      {/* 「幼儿随手记」技能 */}
      {chatCard === EEduBehaviorChatCard.IntelligentInfoExtraction && <IntelligentInfoExtraction data={data} />}
      {chatItem.componentInParam && <DuplicateNameConfirm />}

      {/* 「观察记录生成」技能 */}
      {chatCard === EEduBehaviorChatCard.ObservationRecord && <ObservationRecord showBtn={true} />}
      {chatCard === EEduBehaviorChatCard.GenerateObservationRecords && <GenerateObservationRecords />}

      {/* 「观察要点指导、观察分析建议」技能 */}
      {chatCard === EEduBehaviorChatCard.ObservationPoints && <ObservationPoints data={data} />}
    </View>
  );
};

export default EduAnswer;
