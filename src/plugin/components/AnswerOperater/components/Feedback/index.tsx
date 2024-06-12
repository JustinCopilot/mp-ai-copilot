import React, { useState, useContext } from 'react';
import { View } from '@tarojs/components';
import { useRequest } from 'ahooks';
import { GlobalContext } from '@plugin/stores/GlobalContext';
import { ChatWrapperContext } from '@plugin/stores/ChatWrapperContext';
import { ELikeType } from '@plugin/request/chat/type';
import { putFeedbackApi } from '@plugin/request';
import type { IChatItem } from '../../../ChatWrapper';
import DislikeDialog from '../../components/DislikeDialog';
import IconWrap from '../../components/IconWrap';
import './index.less';

export enum ELikedState {
  Init, // 初始状态
  ThumbsUp, // 点赞
  ThumbsDown, // 点踩
}
export interface IFeedbackProps {
  chatItem: Partial<IChatItem> & { chatContent: string };
}

const Feedback: React.FC<IFeedbackProps> = ({ chatItem }) => {
  const globalContext = useContext(GlobalContext);
  const { microAppId } = useContext(ChatWrapperContext) || {};

  const { dataId, like = null } = chatItem;

  // 通过历史记录的点赞状态，返回默认的高亮状态值
  const getDefaultHightLight = (like: ELikeType | null) => {
    let defaultHightLight = ELikedState.Init;
    if (like === ELikeType.GOOD) {
      defaultHightLight = ELikedState.ThumbsUp;
    } else if (like === null) {
      defaultHightLight = ELikedState.Init;
    } else {
      defaultHightLight = ELikedState.ThumbsDown;
    }
    return defaultHightLight;
  };
  // 点赞和点踩处理
  const [highlight, setHighlight] = useState(getDefaultHightLight(like));

  const handleInit = () => {
    setHighlight(ELikedState.Init);
    handlePutFeedback(null);
  };
  const handleLike = () => {
    console.log('handleLike', highlight);
    // 如果当前高亮的不是点赞，则将点赞设为高亮
    if (highlight !== ELikedState.ThumbsUp) {
      setHighlight(ELikedState.ThumbsUp);
      handlePutFeedback(ELikeType.GOOD);
    }
  };
  const handleDislike = () => {
    // 如果当前高亮的不是点踩，则将点踩设为高亮
    if (highlight !== ELikedState.ThumbsDown) {
      setHighlight(ELikedState.ThumbsDown);
      handlePutFeedback(ELikeType.BAD);
      handleOpenDislikeDialog();
    }
  };

  // 点赞点踩请求
  const { run: putFeedback } = useRequest(putFeedbackApi, {
    manual: true,
    onSuccess: () => {
      // Taro.showToast({
      //   title: res ? '反馈失败' : '反馈成功',
      //   icon: 'none',
      // });
    },
  });
  const handlePutFeedback = (like: ELikeType | null, reason?: string) => {
    if (dataId === undefined) return;
    putFeedback({
      dataId,
      microAppId: microAppId!,
      like,
      reason,
    });
  };

  // 反馈组件弹窗逻辑
  const handleOpenDislikeDialog = () => {
    globalContext?.setBottomDialogContent(
      <DislikeDialog
        onClose={() => {
          globalContext?.hideBottomDialog();
        }}
        handlePutFeedback={handlePutFeedback}
      />,
    );
    globalContext?.showBottomDialog();
  };

  return (
    <View className="feedback">
      {highlight === ELikedState.ThumbsUp ? (
        <IconWrap icon="thumbs_up_highlighted" onClick={handleInit} />
      ) : (
        <IconWrap icon="thumbs_up" onClick={handleLike} />
      )}
      {highlight === ELikedState.ThumbsDown ? (
        <IconWrap icon="thumbs_down_highlighted" onClick={handleInit} />
      ) : (
        <IconWrap icon="thumbs_down" onClick={handleDislike} />
      )}
    </View>
  );
};

export default Feedback;
