import React from 'react';

/**
 * @description 定义全局上下文的接口(注：插件需要单独为每个页面注入该上下文)
 */

export interface IGlobalContext {
  scope: any;
  // 页面蒙层
  showMask: () => void;
  hideMask: () => void;
  setMaskClosable: (close: boolean) => void; // 设置点击蒙层是否支持隐藏
  whenMaskOnClick: (cb: () => void) => void; // 自定义点击蒙层触发回调

  // 底部弹窗
  showBottomDialog: () => void;
  isShowBottomDialog: boolean;
  hideBottomDialog: () => void;
  setBottomDialogContent: (contetn: React.ReactNode) => void;

  // 在此添加更多的全局状态和方法
}

// 创建全局上下文
export const GlobalContext = React.createContext<IGlobalContext | null>(null);
