import React, { useState, useEffect, useContext } from 'react';
import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';
import { ChatWrapperContext } from '@plugin/stores/ChatWrapperContext';
import DynamicBars from '../../components/DynamicBars';
import { EOperateState } from '../..';
import '../SpeechRecognition/index.less';

const plugin = Taro.requirePlugin('QCloudAIVoice');
// 获取全局唯一的语音识别管理器
const speechRecognizerManager = plugin.speechRecognizerManager();

interface IVoiceCallProps {
  onClick: () => void;
  onSend: (text: string) => void;
  isVisible: boolean;
}

const SpeechRecognition: React.FC<IVoiceCallProps> = ({ onClick, isVisible, onSend }) => {
  const { changeOperateState } = useContext(ChatWrapperContext) || {};
  const [content, setContent] = useState('');
  let timer;

  const initRecord = () => {
    // 开始识别
    speechRecognizerManager.OnRecognitionStart = (res) => {
      console.log('开始识别', res);
    };
    // 一句话开始
    speechRecognizerManager.OnSentenceBegin = (res) => {
      console.log('一句话开始', res);
    };
    // 识别变化时
    speechRecognizerManager.OnRecognitionResultChange = (res) => {
      console.log('识别变化时', res);
      setContent(res?.result?.voice_text_str);
      clearTimeout(timer);
      timer = setTimeout(() => {
        speechRecognizerManager.stop();
      }, 3000);
    };
    // 识别结束
    speechRecognizerManager.OnRecognitionComplete = (res) => {
      console.log('识别结束', res);
    };
    // 识别错误
    let errorAuthModel = false;
    speechRecognizerManager.OnError = (res) => {
      // code为6001时，国内站用户请检查是否使用境外代理，如果使用请关闭。境外调用需开通国际站服务
      console.log('识别失败', res);
      if (!errorAuthModel && res.errno === 103) {
        errorAuthModel = true;
        Taro.showModal({
          title: '麦克风获取失败',
          content: '当前麦克风的使用权限被禁止，请前往小程序的设置页开启麦克风权限',
          cancelText: '取消',
          confirmText: '前往',
          success: ({ confirm }) => {
            if (confirm) {
              Taro.openSetting({
                success: (res) => {
                  console.log(res.authSetting);
                },
              });
            }
          },
          complete: () => {
            errorAuthModel = false;
          },
        });
      }
    };
    // 录音结束（最长10分钟）时回调
    speechRecognizerManager.OnRecorderStop = (res) => {
      console.log('录音结束', res);
    };

    // 需要开始识别时调用此方法
    const params = {
      signCallback: null, // 鉴权函数
      // 用户参数
      // @TODO: 欠缺加密参数
      // token: '',  // 选填参数，若密钥为临时密钥，需传此参数。
      // 录音参数
      duration: 60000,
      frameSize: 0.32, // 单位:k

      // 实时识别接口参数
      engine_model_type: '16k_zh',
      // 以下为非必填参数，可跟据业务自行修改
      // hotword_id : '08003a00000000000000000000000000',
      // needvad: 0,
      // filter_dirty: 1,
      // filter_modal: 2,
      // filter_punc: 0,
      // convert_num_mode : 1,
      // word_info: 2,
      // vad_silence_time: 200
    };
    console.log('record init start');
    speechRecognizerManager.start(params);
  };

  useEffect(() => {
    speechRecognizerManager.OnSentenceEnd = (res) => {
      console.log('一句话结束', res);

      const str = res?.result?.voice_text_str;
      if (str && isVisible) {
        onSend(str);
        onClick();
      }
      setContent('');
    };

    if (isVisible) {
      initRecord();
    }

    return () => {
      clearTimeout(timer);
      speechRecognizerManager.stop();
    };
  }, [isVisible]);

  return (
    <View className="speech_recognition" style={{ display: isVisible ? 'flex' : 'none' }}>
      <View className="content">{content}</View>
      <View className="operator">
        <View className="close_btn" onClick={onClick} />
        <DynamicBars barCount={7} />
        <View className="text_btn" onClick={() => changeOperateState?.(EOperateState.TEXT_REST)} />
      </View>
    </View>
  );
};

export default SpeechRecognition;
