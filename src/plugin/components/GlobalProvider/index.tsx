import React, { useState, useMemo, useEffect } from 'react';
import { GlobalContext } from '@plugin/stores/GlobalContext';
import BottomDialog from './components/BottomDialog';
import Mask from './components/Mask';

const GlobalProvider: React.FC<any> = ({ children, scope }) => {
  const [showMask, setShowMask] = useState(false);
  const [maskClosable, setMaskClosable] = useState(true);
  const [maskOnClick, setMaskOnClick] = useState<() => void>();
  const [showBottomDialog, setShowBottomDialog] = useState(false);
  const [shouldRenderBottomDialog, setShouldRenderBottomDialog] = useState(false);
  const [bottomDialogContent, setBottomDialogContent] = useState<React.ReactNode>(null);

  // 处理需要自定义点击蒙层的逻辑，保存回调到 maskOnClick
  const handleSetMaskOnClick = (cb: () => void) => {
    // 延迟 300 毫秒设置蒙层的 onClick 事件处理函数，防止弹窗和蒙层刚出现时被隐藏
    setTimeout(() => {
      setMaskOnClick(() => cb);
    }, 300);
  };

  useEffect(() => {
    if (showBottomDialog) {
      setShouldRenderBottomDialog(true);
    } else {
      const timer = setTimeout(() => {
        setShouldRenderBottomDialog(false);
      }, 300); // 确保这里的延时与动画时长匹配
      return () => clearTimeout(timer);
    }
  }, [showBottomDialog]);

  const contextValue = useMemo(
    () => ({
      scope,
      showMask: () => setShowMask(true),
      hideMask: () => setShowMask(false),
      setMaskClosable,
      whenMaskOnClick: handleSetMaskOnClick,
      showBottomDialog: () => {
        setShowMask(true);
        setShowBottomDialog(true);
      },
      isShowBottomDialog: showBottomDialog,
      hideBottomDialog: () => {
        setShowMask(false);
        setShowBottomDialog(false);
      },
      setBottomDialogContent,
    }),
    [showBottomDialog],
  );

  const handleMaskOnClick = () => {
    if (maskOnClick) {
      // 如果有设置蒙层点击回调直接执行回调
      maskOnClick();
    } else if (maskClosable) {
      // 除非设置了点击不关闭蒙层，否则关闭蒙层和所有弹窗
      setShowMask(false);
      setShowBottomDialog(false);
    }
  };

  return (
    <GlobalContext.Provider value={contextValue}>
      {children}
      {showMask && <Mask onClick={handleMaskOnClick} />}
      {shouldRenderBottomDialog && <BottomDialog isVisible={showBottomDialog} content={bottomDialogContent} />}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
