import React, { useState, useContext, useEffect, useMemo } from 'react';
import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';
import { ChatWrapperContext } from '@plugin/stores/ChatWrapperContext';
// import DynamicBars from '../DynamicBars';
import IconWrap from '../IconWrap';
import type { IChatItem } from '../../../ChatWrapper';
import './index.less';

export interface IVoicePlayProps {
  chatItem: Partial<IChatItem> & { chatContent: string };
}

// 文字转语音处理
const plugin = Taro.requirePlugin('WechatSI');
const innerAudioContext = Taro.createInnerAudioContext({
  // 是否使用 WebAudio 作为底层音频驱动，默认关闭。对于短音频、播放频繁的音频建议开启此选项，开启后将获得更优的性能表现。
  // 由于开启此选项后也会带来一定的内存增长，因此对于长音频建议关闭此选项
  useWebAudioImplement: true,
});
function splitText(text: string, maxLength: number) {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += maxLength) {
    chunks.push(text.substring(i, i + maxLength));
  }
  return chunks;
}

const VoicePlay: React.FC<IVoicePlayProps> = ({ chatItem }) => {
  const {
    currentPlayingId,
    changeCurrentPlayingId,
    currentPlayingContent,
    changeCurrentPlayingContent,
    isVoice,
    ifPlayVoice,
    changeIfPlayVoice,
  } = useContext(ChatWrapperContext) || {};
  const [isPlaying, setIsPlaying] = useState(false);

  const { uniqueId = '-1', chatContent, playContent, componentInParam } = chatItem;

  const textToSpeech = useMemo(() => {
    const playSegment = (segments, index = 0) => {
      if (index >= segments.length) {
        changeCurrentPlayingId?.(undefined);
        return;
      }

      const content = segments[index];
      plugin.textToSpeech({
        lang: 'zh_CN',
        tts: true,
        content,
        success: (res) => {
          innerAudioContext.src = res.filename;
          innerAudioContext.onPlay(() => {
            // 开始播放回调
          });
          innerAudioContext.onError((err) => {
            console.log('%c [ 播放错误 ]', 'font-size:13px; background:pink; color:#bf2c9f;', err);
          });
          innerAudioContext.offEnded();
          innerAudioContext.onEnded(() => {
            playSegment(segments, index + 1);
          });
          innerAudioContext.play();
        },
        fail: (err) => {
          console.log('%c [ 播放失败 ]', 'font-size:13px; background:pink; color:#bf2c9f;', err);
        },
      });
    };

    return (content) => {
      const segments = splitText(content, 200); // 将文本分割成200字的段落
      playSegment(segments); // 开始播放分段
    };
  }, [chatItem]);

  // 切换播放和暂停状态（如果当前点击的回答项的id）
  const handleChangePlaying = () => {
    changeIfPlayVoice?.(true);
    changeCurrentPlayingId?.(currentPlayingId && currentPlayingId === uniqueId ? undefined : uniqueId);
  };

  useEffect(() => {
    if (!ifPlayVoice) return; // 文字输入不需要播放语音

    const doPlay = currentPlayingId === uniqueId && !isVoice;
    if (doPlay) {
      setIsPlaying(true);

      let content = '';
      if (playContent || chatContent) {
        content = playContent || chatContent;
      } else if (componentInParam) {
        const copyComponentInParam = JSON.parse(componentInParam);
        const prefix = copyComponentInParam.map((item) => item.prefix);
        content = prefix.join('');
      }
      textToSpeech(currentPlayingContent || content || '暂无播报内容');
      changeCurrentPlayingContent?.(undefined);
    } else {
      setIsPlaying(false);
      innerAudioContext.stop();
    }
    return () => {
      setIsPlaying(false);
      innerAudioContext.stop();
    };
  }, [currentPlayingId, isVoice, ifPlayVoice, chatContent, playContent, currentPlayingContent]);

  return (
    <View className="voice-play">
      <IconWrap icon={isPlaying ? 'pause' : 'play'} onClick={handleChangePlaying} />
      {/* <DynamicBars isAnimating={isPlaying} /> */}
    </View>
  );
};

export default VoicePlay;
