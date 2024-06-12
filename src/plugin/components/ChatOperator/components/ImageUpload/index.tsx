import React, { useEffect, useContext } from 'react';
import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';
import { ChatWrapperContext } from '@plugin/stores/ChatWrapperContext';
import { EAnswerStatus } from '@plugin/components/ChatWrapper';
import { EChatUser, EBubbleKey } from '@plugin/request/chat/type';
import useGetScenes from '@plugin/hooks/useGetScenes';
import { generateUUID } from '@plugin/utils';
import './index.less';

const ImageUpload = () => {
  const {
    microAppId,
    answerStatus,
    changeAnswerStatus,
    chatList = [],
    setChatList,
    imageUploader,
  } = useContext(ChatWrapperContext) || {};

  const { isBeautySummaryScenes } = useGetScenes(microAppId);

  const handleChooseImg = () => {
    console.log('%c [ answerStatus ]', 'font-size:13px; background:pink; color:#bf2c9f;', answerStatus);
    if (answerStatus !== EAnswerStatus.UN_ANSWER) {
      return Taro.showToast({
        title: '正在回复中',
        icon: 'none',
      });
    }
    imageUploader?.chooseImage();
    changeAnswerStatus?.(EAnswerStatus.ANSWERING);
  };

  // 美业回访总结图片上传
  const afterBeautyImagesUpload = () => {
    // 触发会话列表更新图片块
    setChatList?.([
      ...chatList,
      ...[
        {
          chatUser: EChatUser.Image,
          chatContent: '',
          imageList: JSON.stringify(imageUploader.uploadedUrls),
          tempImageList: JSON.stringify(imageUploader.images),
          dataId: generateUUID(),
        },
        {
          chatUser: EChatUser.Ai,
          chatContent: '是否还需要补充回访信息？',
          dataId: generateUUID(),
          bubbleList: `[
            {"bubbleInfo": "需要", "key": "${EBubbleKey.NEED}"},
            {"bubbleInfo": "直接生成回访总结", "key": "${EBubbleKey.UNNEED}"}
          ]`,
        },
      ],
    ]);
    // 为了触发屏幕滚动到最底部
    changeAnswerStatus?.(EAnswerStatus.ANSWERING);
  };

  useEffect(() => {
    // 图片全部上传完成
    if (imageUploader?.uploadProgress === 100) {
      if (isBeautySummaryScenes) {
        afterBeautyImagesUpload();
      }
    }
  }, [imageUploader?.uploadedUrls]);

  return <View className="image-upload" onClick={handleChooseImg} />;
};

export default ImageUpload;
