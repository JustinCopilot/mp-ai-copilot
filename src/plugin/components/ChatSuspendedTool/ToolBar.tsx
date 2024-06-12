// import type { ReactNode } from 'react';
import Taro from '@tarojs/taro';
import { ChatWrapperContext } from '@plugin/stores/ChatWrapperContext';
import React, { useContext, useEffect, useState } from 'react';
import { Image, View } from '@tarojs/components';
import './ToolBar.less';

interface ToolBarProps {
  show?: boolean;
  copyText?: string | null;
  onVoicePlay?: Function | null;
  onShare?: Function | null;
  pointX: number;
  pointY: number;
}

const ToolBar: React.FC<ToolBarProps> = ({ show = false, pointX, pointY, copyText, onShare, onVoicePlay }) => {
  const [visit, setVisit] = useState(false);
  const { setChatSuspendedToolShow } = useContext(ChatWrapperContext) || {};

  const handeCopy = () => {
    if (!copyText) return;
    Taro.setClipboardData({
      data: copyText,
      success: () => {
        Taro.showToast({
          title: '复制成功',
          icon: 'none',
        });
      },
      complete: () => {
        setChatSuspendedToolShow && setChatSuspendedToolShow(false);
      },
    });
  };

  useEffect(() => {
    let timer;
    if (show) {
      setVisit(true);
      if (timer) {
        clearTimeout(timer);
      }
    } else {
      timer = setTimeout(() => {
        setVisit(false);
      }, 300);
    }
  }, [show]);

  const handlePlayVoice = () => {
    onVoicePlay && onVoicePlay();
    setChatSuspendedToolShow && setChatSuspendedToolShow(false);
  };

  // const handleShare = () => {
  //   onShare && onShare();
  //   setChatSuspendedToolShow && setChatSuspendedToolShow(false);
  // };
  return visit ? (
    <View className={`toolBar${show ? ' show' : ''}`} style={{ left: pointX, top: pointY }}>
      <View className={`animation${show ? ' show' : ''}`}>
        {copyText && copyText !== null ? (
          <View className="toolBar-item" onClick={handeCopy}>
            <Image className="toolBar-item-icon" src="https://senior.cos.clife.cn/xiao-c/icon-toolbar-copy.png" />
            <View className="toolBar-item-text">复制</View>
            <View className="toolBar-item-line" />
          </View>
        ) : null}
        {onVoicePlay ? (
          <View className="toolBar-item" onClick={handlePlayVoice}>
            <Image className="toolBar-item-icon" src="https://senior.cos.clife.cn/xiao-c/icon-toolbar-voice.png" />
            <View className="toolBar-item-text">播报</View>
            <View className="toolBar-item-line" />
          </View>
        ) : null}
        {/* {onShare ? (
          <View className="toolBar-item" onClick={handleShare}>
            <Image className="toolBar-item-icon" src="https://senior.cos.clife.cn/xiao-c/icon-toolbar-share.png" />
            <View className="toolBar-item-text">分享</View>
            <View className="toolBar-item-line" />
          </View>
        ) : null} */}
        <View className="arrow-down" />
      </View>
    </View>
  ) : null;
};

export default ToolBar;
