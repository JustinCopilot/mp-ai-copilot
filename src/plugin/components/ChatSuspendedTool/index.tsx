import type { ReactNode } from 'react';
import Taro from '@tarojs/taro';
import { GlobalContext } from '@plugin/stores/GlobalContext';
import React, { useRef, useContext } from 'react';
import { View } from '@tarojs/components';
import { ChatWrapperContext } from '@plugin/stores/ChatWrapperContext';

interface LongPressPopoverProps {
  id: string;
  copyText?: string;
  onVoicePlay?: Function;
  onShare?: Function;
  children?: ReactNode;
}

interface TouchPosition {
  x: number;
  y: number;
}

let touchPosition: TouchPosition = { x: 0, y: 0 };
const ChatSuspendedTool: React.FC<LongPressPopoverProps> = ({
  id,
  copyText = null,
  onVoicePlay = null,
  onShare = null,
  children,
}) => {
  const {
    setChatSuspendedToolPositionX,
    setChatSuspendedToolPositionY,
    setChatSuspendedToolShow,
    setChatSuspendedToolCopyText,
    setChatSuspendedToolVoicePlay,
    setChatSuspendedToolShare,
  } = useContext(ChatWrapperContext) || {};
  const globalContext = useContext(GlobalContext);
  const ref = useRef<HTMLDivElement>(null);
  // const [touchPosition, setTouchPosition] = useState<TouchPosition>({
  //   x: 0,
  //   y: 0,
  // });

  const timerRef = useRef<any | null>(null);

  const handleTouchStart = (event: any) => {
    // 记录初始触摸位置
    touchPosition = {
      x: event.touches[0].pageX,
      y: event.touches[0].pageY,
    };

    if (!copyText && !onVoicePlay && !onShare) return;
    // 设置长按计时器
    timerRef.current = setTimeout(() => {
      setCenterByContrain(() => {
        setChatSuspendedToolShow && setChatSuspendedToolShow(true);

        setChatSuspendedToolCopyText && setChatSuspendedToolCopyText(copyText);
        setChatSuspendedToolVoicePlay && setChatSuspendedToolVoicePlay(() => onVoicePlay);
        setChatSuspendedToolShare && setChatSuspendedToolShare(() => onShare);
      });
    }, 500); // 长按时间阈值为1秒
  };

  const handleTouchMove = (event: any) => {
    // 如果手指移动超过一定距离，则取消长按操作
    const moveThreshold = 10; // 可根据需求调整移动阈值
    if (
      Math.abs(event.touches[0].pageX - touchPosition.x) > moveThreshold ||
      Math.abs(event.touches[0].pageY - touchPosition.y) > moveThreshold
    ) {
      clearTimeout(timerRef.current!);
      setChatSuspendedToolShow && setChatSuspendedToolShow(false);
    }
  };

  const setCenterByContrain = (cb: Function) => {
    Taro.createSelectorQuery()
      .in(globalContext?.scope)
      .select(`#${id}`)
      .boundingClientRect((rect: any) => {
        console.log(rect);
        setChatSuspendedToolPositionX && setChatSuspendedToolPositionX(rect.width / 2 + rect.left);
        setChatSuspendedToolPositionY && setChatSuspendedToolPositionY(touchPosition.y);
        // setCenterX(rect.width / 2)
        cb();
      })
      .exec((rect) => {
        console.log(rect);
      });
  };

  const handleTouchEnd = () => {
    // 触摸结束时清除计时器，避免在非长按时触发工具条显示
    clearTimeout(timerRef.current!);
    // setShowToolBar(false);
  };

  return (
    <View id={id} ref={ref} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      {/* <ToolBar
        show={showToolBar}
        pointX={pointPosition.x}
        pointY={pointPosition.y - 80}
        copyText={copyText}
        onVoicePlay={onVoicePlay}
        onShare={onShare}
      /> */}
      {children}
    </View>
  );
};

export default ChatSuspendedTool;
