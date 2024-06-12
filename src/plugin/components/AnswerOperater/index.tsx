import React, { useContext, useMemo } from 'react';
import { View } from '@tarojs/components';
import { EOperateState } from '@plugin/components/ChatOperator';
import { ChatWrapperContext } from '@plugin/stores/ChatWrapperContext';
import useGetScenes from '@plugin/hooks/useGetScenes';
import type { IChatItem } from '../ChatWrapper';
import { EAnswerStatus, UN_SUPPORT_TEXT } from '../ChatWrapper';
import Feedback from './components/Feedback';
import VoicePlay from './components/VoicePlay';
import ReGenerator from './components/ReGenerator';
import AdjustContent from './components/AdjustContent';
import './index.less';

export interface IAnswerOperaterProps {
  isLastAnswer: boolean;
  chatItem: Partial<IChatItem> & { chatContent: string };
}

const AnswerOperater: React.FC<IAnswerOperaterProps> = ({ isLastAnswer, chatItem }) => {
  const { answerStatus, operateState, microAppId } = useContext(ChatWrapperContext) || {};
  const { isBeautySummaryScenes, isEduKnowledgeScenes, isEduPhotoScenes, isEduBehaviorScenes } =
    useGetScenes(microAppId);

  /**
   * @description 语音按钮展示逻辑
   * 1、特殊逻辑：美业最后一条回复才展示
   * 2、特殊逻辑：智能相册有 chatContent 或者 componentInParam 才展示
   * @returns boolean
   */
  const showVoicePlay = useMemo(() => {
    const edu_knowledge_scenes = isEduKnowledgeScenes && chatItem.chatContent;
    const edu_photo_scenes = isEduPhotoScenes && (chatItem.chatContent || chatItem.componentInParam);
    const beauty_summary_scenes = isBeautySummaryScenes && chatItem.chatContent && isLastAnswer;
    const edu_behavior_scenes = isEduBehaviorScenes;

    return (
      !chatItem.hideVoicePlay &&
      (edu_knowledge_scenes || edu_photo_scenes || beauty_summary_scenes || edu_behavior_scenes)
    );
  }, [isBeautySummaryScenes, isEduKnowledgeScenes, isEduPhotoScenes, isEduBehaviorScenes, isLastAnswer, chatItem]);

  /**
   * @description 反馈按钮展示逻辑
   * 1、通用逻辑：最后一条回复、有具体触发对象、不在回答中、没有手动隐藏
   * 2、特殊逻辑：美业除了回访总结有展示外，其余回复均不展示
   * @returns boolean
   */
  const showFeedback = useMemo(() => {
    const edu_knowledge_scenes = isEduKnowledgeScenes;
    const edu_photo_scenes =
      isEduPhotoScenes && ((chatItem.imageList && chatItem.bubbleList) || chatItem.chatContent === UN_SUPPORT_TEXT);
    const beauty_summary_scenes = isBeautySummaryScenes && chatItem.agentResponse;
    const edu_behavior_scenes = isEduBehaviorScenes;

    return (
      isLastAnswer &&
      !chatItem.hideFeedback &&
      (edu_knowledge_scenes || edu_photo_scenes || beauty_summary_scenes || edu_behavior_scenes)
    );
    // return (
    //   isLastAnswer &&
    //   !!chatItem.chatUser &&
    //   answerStatus === EAnswerStatus.UN_ANSWER &&
    //   !chatItem.hideFeedback &&
    //   microAppId &&
    //   (![EMicroAppIdITest.BEAUTY_SUMMARY, EMicroAppIdProd.BEAUTY_SUMMARY].includes(microAppId) ||
    //     ([EMicroAppIdITest.BEAUTY_SUMMARY, EMicroAppIdProd.BEAUTY_SUMMARY].includes(microAppId) &&
    //       chatItem.agentResponse))
    // );
  }, [isBeautySummaryScenes, isEduKnowledgeScenes, isEduPhotoScenes, isEduBehaviorScenes, isLastAnswer, chatItem]);

  /**
   * @description 调整按钮展示逻辑
   * 1、通用逻辑：最后一条回复、不在回答中
   * 2、特殊逻辑：只有美业需要展示(RETURN_VISIT_SUMMARY_CONFIRM)
   * @returns boolean
   */
  const showAdjustContent = useMemo(() => {
    return (
      isLastAnswer &&
      answerStatus === EAnswerStatus.UN_ANSWER &&
      operateState === EOperateState.RETURN_VISIT_SUMMARY_CONFIRM
    );
  }, [answerStatus, isLastAnswer, operateState]);

  /**
   * @description 重新生成按钮展示逻辑
   * 1、通用逻辑：最后一条回复、不在回答中、没有手动隐藏
   * 2、特殊逻辑：美业除了回访总结有展示外，其余回复均不展示
   * 3、特殊逻辑：幼教智能相册都不显示
   * @returns boolean
   */
  const showReGenerator = useMemo(() => {
    const edu_knowledge_scenes = isEduKnowledgeScenes;
    const edu_photo_scenes = !isEduPhotoScenes;
    const beauty_summary_scenes = isBeautySummaryScenes && chatItem.agentResponse;
    const edu_behavior_scenes = isEduBehaviorScenes;

    return (
      isLastAnswer &&
      !chatItem.hideReGenerator &&
      (edu_knowledge_scenes || edu_photo_scenes || beauty_summary_scenes || edu_behavior_scenes)
    );
    // return (
    //   isLastAnswer &&
    //   answerStatus === EAnswerStatus.UN_ANSWER &&
    //   !chatItem.hideReGenerator &&
    //   microAppId &&
    //   [EMicroAppIdITest.EDU_PHOTO, EMicroAppIdProd.EDU_PHOTO].includes(microAppId) &&
    //   !(chatItem.bubbleList || chatItem.componentInParam) &&
    //   (![EMicroAppIdITest.BEAUTY_SUMMARY, EMicroAppIdProd.BEAUTY_SUMMARY].includes(microAppId) ||
    //     ([EMicroAppIdITest.BEAUTY_SUMMARY, EMicroAppIdProd.BEAUTY_SUMMARY].includes(microAppId) &&
    //       chatItem.agentResponse))
    // );
  }, [isBeautySummaryScenes, isEduKnowledgeScenes, isEduPhotoScenes, isEduBehaviorScenes, chatItem, isLastAnswer]);

  return (
    <View
      className={`operate-bar ${isLastAnswer ? 'show' : 'hide'} ${(showVoicePlay || showFeedback || showAdjustContent || showReGenerator) && 'operate-bar-divider'}`}
    >
      <View className="operate-bar-left">
        {showVoicePlay && <VoicePlay chatItem={chatItem} />}
        {showFeedback && <Feedback chatItem={chatItem} />}
      </View>
      <View className="operate-bar-right">
        {showAdjustContent && <AdjustContent />}
        {showReGenerator && <ReGenerator />}
      </View>
    </View>
  );
};

export default AnswerOperater;
