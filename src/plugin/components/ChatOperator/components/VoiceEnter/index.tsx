import React, { useContext } from 'react';
import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';
import { GlobalContext } from '@plugin/stores/GlobalContext';
import { ChatWrapperContext } from '@plugin/stores/ChatWrapperContext';
// import StaticVoice from '@sub-pag/components/StaticVoice';
import { StaticVoice } from '@plugin/components/PagIcon';
import useGetScenes from '@plugin/hooks/useGetScenes';
import { EAnswerStatus } from '@plugin/components/ChatWrapper';
import { EOperateState } from '../..';
import ImageUpload from '../ImageUpload';
import SpeechRecognition from '../QCloudAIVoice';
import './index.less';

interface IVoiceEnterProps {
  handleSend: (content: string) => void;
}

const VoiceEnter: React.FC<IVoiceEnterProps> = ({ handleSend }) => {
  const { operateState, microAppId, changeOperateState, answerStatus, imageUploader, abortChatRequest } =
    useContext(ChatWrapperContext) || {};
  const globalContext = useContext(GlobalContext);

  const { isBeautySummaryScenes } = useGetScenes(microAppId);

  const handleStartVoicing = () => {
    if (answerStatus !== EAnswerStatus.UN_ANSWER) {
      return Taro.showToast({
        title: '正在回复中',
        icon: 'none',
      });
    }
    changeOperateState?.(EOperateState.VOICE_ENTER);
  };

  // 终止会话或者图片加载
  const handleAbort = () => {
    if (imageUploader?.isUploading) {
      imageUploader?.cancelUpload();
    } else {
      abortChatRequest?.();
    }
  };

  return (
    <View className="voice-enter">
      {operateState === EOperateState.VOICE_REST && microAppId && !imageUploader?.isUploading && (
        <View className="upload_img_btn">{isBeautySummaryScenes && <ImageUpload />}</View>
      )}

      <View
        className="voice-btn"
        onClick={handleStartVoicing}
        style={{
          display: operateState === EOperateState.VOICE_REST && !globalContext?.isShowBottomDialog ? 'block' : 'none',
        }}
      >
        <StaticVoice play={operateState === EOperateState.VOICE_REST && !globalContext?.isShowBottomDialog} />
        {/* <xiao-c-static-voice play={operateState === EOperateState.VOICE_REST && !globalContext?.isShowBottomDialog} /> */}
      </View>

      <SpeechRecognition
        isVisible={operateState === EOperateState.VOICE_ENTER}
        onClick={() => changeOperateState?.(EOperateState.VOICE_REST)}
        onSend={handleSend}
      />

      {operateState &&
        (answerStatus !== EAnswerStatus.UN_ANSWER && operateState === EOperateState.VOICE_REST ? (
          <View className="abort-btn" onClick={handleAbort} />
        ) : (
          operateState === EOperateState.VOICE_REST && (
            <View className="text-btn" onClick={() => changeOperateState?.(EOperateState.TEXT_REST)} />
          )
        ))}
    </View>
  );
};

export default VoiceEnter;
