import React, { useEffect, useContext, useMemo } from 'react';
import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';
import { EChatMode } from '@plugin/request/chat/type';
import { ChatWrapperContext } from '@plugin/stores/ChatWrapperContext';
import { EAnswerStatus, ECheckStatus } from '@plugin/components/ChatWrapper';
import { ESummaryStatus } from '@plugin/components/ChatWrapper/hooks/useBeautySummary';
import useGetScenes from '@plugin/hooks/useGetScenes';
import VoiceEnter from './components/VoiceEnter';
import InputEnter from './components/InputEnter';
import BeautyOperator from './components/BeautyOperator';
import BubbleList from './components/BubbleList';
import './index.less';

const INPUT_ENTER_HEIGHT = 90; // 文字输入默认高度
const VOICE_ENTER_HEIGHT = 125; // 语音输入默认高度
const BEHAVIOR_BUBBLE_HEIGHT = 50; // 行为观察助手气泡高度

export enum EOperateState {
  VOICE_REST = 1, // 语音静止态
  VOICE_ENTER = 2, // 语音输入态
  TEXT_REST = 3, // 文字静止态
  TEXT_ENTER = 4, // 文字输入态
  CHECK = 5, // 确认信息态（幼教智能相册）
  SELECT_RETURN_VISIT_WAY = 6, // 选择回访方式（美业回访总结）
  NEW_SESSION = 7, // 重新开始会话
  SELECT_COMMAND = 8, // 选择指令（美业回访总结）
  RETURN_VISIT_SUMMARY_CONFIRM = 9, // 回访总结确认（美业回访总结）
}

interface IOperaterProps {
  externalQuestionUUID?: string; // 改值发生变化时，将文本框内容，强行设置为externalQuestionStr
  externalQuestionStr?: string; // 从外部传入的初始questionStr，可选
  onSend?: (questionStr: string, mode?: EChatMode) => void; // 发送按钮被点击时的回调，可选
  onOpenNewSession?: () => void;
}

// eslint-disable-next-line complexity
const Operater: React.FC<IOperaterProps> = ({
  externalQuestionUUID = '',
  externalQuestionStr = '',
  onSend,
  onOpenNewSession,
}) => {
  const {
    microAppId,
    operateState = EOperateState.VOICE_REST,
    changeOperateState,
    answerStatus,
    changeAnswerStatus,
    checkStatus,
    summaryStatus,
    imageUploader,
    changeIfPlayVoice,
    changeCurrentPlayingId,
    changeShowLoadingImgBlock,
    changeVoiceStatus,
    questionStrChange,
  } = useContext(ChatWrapperContext) || {};

  const { isBeautySummaryScenes, isEduPhotoScenes, isEduBehaviorScenes } = useGetScenes(microAppId);

  const handleSend = (content: string) => {
    if (answerStatus !== EAnswerStatus.UN_ANSWER) {
      return Taro.showToast({
        title: '正在回复中',
        icon: 'none',
      });
    }
    changeIfPlayVoice?.(operateState === EOperateState.VOICE_ENTER);
    if (externalQuestionStr) {
      onSend?.(content, EChatMode.EDIT);
    } else {
      onSend?.(content);
    }
    questionStrChange?.(''); // 清空全局的问题内容，避免直接输入问题提问的时候，mode识别为重新编辑
  };

  const operarotContainerStyle = useMemo(() => {
    const isInputEnter = [EOperateState.TEXT_REST, EOperateState.TEXT_ENTER].includes(operateState);
    const height = isInputEnter ? INPUT_ENTER_HEIGHT : VOICE_ENTER_HEIGHT;
    const backgroundColorStyle = { backgroundColor: '#FFF' };
    const backgroundImageStyle = {
      backgroundImage: 'linear-gradient(180deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1) 17%)',
    };
    return {
      height: `${height + (isEduBehaviorScenes ? BEHAVIOR_BUBBLE_HEIGHT : 0)}px`,
      ...(isInputEnter || isEduBehaviorScenes ? backgroundColorStyle : backgroundImageStyle),
    };
  }, [operateState]);

  useEffect(() => {
    const isUploading = !!imageUploader?.isUploading;
    changeShowLoadingImgBlock?.(!!imageUploader?.images?.length && isUploading);
    changeAnswerStatus?.(isUploading ? EAnswerStatus.ANSWERING : EAnswerStatus.UN_ANSWER);
  }, [imageUploader?.isUploading, imageUploader?.images]);

  useEffect(() => {
    if (operateState === EOperateState.VOICE_ENTER) {
      changeVoiceStatus?.(true);
      changeCurrentPlayingId?.(undefined); // 只要启动语音输入就取消音频播放
    } else {
      changeVoiceStatus?.(false);
    }
  }, [changeVoiceStatus, operateState]);

  useEffect(() => {
    if (!microAppId) return;
    if (isBeautySummaryScenes) {
      summaryStatus &&
        changeOperateState?.(
          summaryStatus === ESummaryStatus.NOT_SUMMARY
            ? EOperateState.VOICE_REST
            : EOperateState[EOperateState[summaryStatus]],
        );
    } else {
      changeOperateState?.(checkStatus === ECheckStatus.CHECKING ? EOperateState.CHECK : EOperateState.VOICE_REST);
    }
  }, [checkStatus, microAppId, summaryStatus, isBeautySummaryScenes]);

  return (
    <View className="operator_container" style={operarotContainerStyle}>
      {/* 幼教行为观察助手气泡 */}
      {isEduBehaviorScenes && <BubbleList />}

      {/* 语音输入 */}
      <VoiceEnter handleSend={handleSend} />

      {/* 文字输入 */}
      {[EOperateState.TEXT_REST, EOperateState.TEXT_ENTER].includes(operateState) && (
        <InputEnter
          handleSend={handleSend}
          externalQuestionStr={externalQuestionStr}
          externalQuestionUUID={externalQuestionUUID}
        />
      )}

      {/* 幼教智能相册确认信息 */}
      {(isEduPhotoScenes || isEduBehaviorScenes) && operateState === EOperateState.CHECK && (
        <View className="bottom_container">
          <View className="tip_text">{isEduPhotoScenes ? '请确认信息' : '请选择'}</View>
          <View className="open_new_session" onClick={() => onOpenNewSession?.()}>
            开启新的会话
          </View>
        </View>
      )}

      {/* 美业回访总结技能 */}
      {isBeautySummaryScenes &&
        operateState &&
        [
          EOperateState.SELECT_RETURN_VISIT_WAY,
          EOperateState.NEW_SESSION,
          EOperateState.SELECT_COMMAND,
          EOperateState.RETURN_VISIT_SUMMARY_CONFIRM,
        ].includes(operateState) && <BeautyOperator handleNewSession={onOpenNewSession} />}
    </View>
  );
};

export default Operater;
