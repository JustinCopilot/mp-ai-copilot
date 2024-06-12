import React, { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';
import DynamicBars from '../../components/DynamicBars';
import './index.less';

const plugin = Taro.requirePlugin('WechatSI');
// 获取全局唯一的语音识别管理器
const recorderManager = plugin.getRecordRecognitionManager();

interface IVoiceCallProps {
  onClick: () => void;
  onSend: (text: string) => void;
  isVisible: boolean;
}

const SpeechRecognition: React.FC<IVoiceCallProps> = ({ onClick, isVisible, onSend }) => {
  const [content, setContent] = useState('');

  const initRecord = () => {
    recorderManager.onRecognize = function (res) {
      console.log('onRecognize: ', res);
    };
    // 正常开始录音识别时会调用此事件
    recorderManager.onStart = function (res) {
      console.log('onStart', res);
      setContent('');
    };
    // 识别错误事件
    recorderManager.onError = function (res) {
      console.error('onError', res);
    };
    // 识别结束事件
    recorderManager.onStop = function (res) {
      console.log('onStop: ', res);
      if (res.result === '') {
        return;
      }
      const text = content + res.result;
      setContent(text);
      setTimeout(() => {
        onSend(text);
        onClick();
        setContent('');
      }, 1000);
    };
  };

  useEffect(() => {
    initRecord();
  }, []);

  useEffect(() => {
    if (isVisible) {
      recorderManager.start({
        lang: 'zh_CN',
        duration: 10000,
      });
    }

    return () => {
      recorderManager.stop();
      setContent('');
    };
  }, [isVisible]);

  return (
    <View className="speech_recognition" style={{ display: isVisible ? 'block' : 'none' }}>
      <View className="close_btn" onClick={onClick} />
      <View className="content">{content}</View>
      <DynamicBars barCount={7} />
    </View>
  );
};

export default SpeechRecognition;
