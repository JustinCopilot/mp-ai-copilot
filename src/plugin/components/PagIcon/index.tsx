import React from 'react';
import PagIcon from './base';

// 语音图标静默状态
export const StaticVoice = (props) => {
  return (
    <PagIcon
      canvasId="StaticVoice"
      width={220}
      height={240}
      // pagSrc="https://senior.cos.clife.cn/xiao-c/01jingmo-zhuangtai.pag"
      pagSrc="https://senior.cos.clife.cn/xiao-c/xiao-c-no-shadow.pag"
      style={{ background: "url('https://senior.cos.clife.cn/xiao-c/icon-xiaoc-shadow.png')", backgroundSize: '100%' }}
      {...props}
      imageSrc="https://senior.cos.clife.cn/xiao-c/voice_btn@2x.png"
      imageStyle={{ width: '90px', height: '100px', marginTop: '20px', marginLeft: '20px' }}
    />
  );
};

// 对话加载
export const LoadingText = () => {
  return (
    <PagIcon
      canvasId="LoadingText"
      width={36 * 2}
      height={20 * 2}
      pagSrc="https://senior.cos.clife.cn/xiao-c/duihua-jiazai.pag"
    />
  );
};

// 图片加载
export const LoadingImg = () => {
  return (
    <PagIcon
      canvasId="LoadingImg"
      width={90 * 2}
      height={44 * 2}
      pagSrc="https://senior.cos.clife.cn/xiao-c/image-progress.pag"
    />
  );
};

export default StaticVoice;
