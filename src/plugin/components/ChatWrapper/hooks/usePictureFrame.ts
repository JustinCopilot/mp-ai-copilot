import { useEffect } from 'react';
import Taro, { useDidShow } from '@tarojs/taro';
import { EBizType, EChatUser } from '@plugin/request/chat/type';
import { EStorage } from '@plugin/types';
import { generateUUID } from '@common/utils';
import useBase64Uploader from '@plugin/hooks/useBase64Uploader';
import useDrawPicture from '@plugin/hooks/useDrawPhoto';
import { EAnswerStatus } from '..';

const usePictureFrame = ({ setChatList, copyChatList, setAnswerStatus, getAnswerResult }) => {
  const { mapPicture, pictureFrameList } = useDrawPicture();
  const { uploadHandle, uploadedUrls } = useBase64Uploader();

  // 从图文生成编辑页面跳回会话页面处理事件钩子
  useDidShow(() => {
    const pageData = Taro.getStorageSync(EStorage.EDU_SYNTHESIS_IMG_LIST);
    if (pageData) {
      mapPicture(pageData);
      setChatList([
        ...copyChatList.current,
        {
          chatContent: '',
          chatUser: EChatUser.Ai,
          uniqueId: generateUUID(),
          pictureFrameList: [],
          hideAnswerOperater: true,
        },
      ]);
      setAnswerStatus(EAnswerStatus.STAR_ANSWER);
    }
  });

  useEffect(() => {
    console.log('pictureFrameList=', pictureFrameList);
    Taro.removeStorageSync(EStorage.EDU_SYNTHESIS_IMG_LIST);
    const lastChat = copyChatList.current[copyChatList.current.length - 1];
    if (pictureFrameList.findIndex((item) => item.errorCode === 1) > -1) {
      lastChat.chatContent = '生成失败';
      setChatList([...copyChatList.current.slice(0, -1), lastChat]);
      setAnswerStatus(EAnswerStatus.UN_ANSWER);
      return;
    }
    if (pictureFrameList.length) {
      if (lastChat.chatUser === EChatUser.Ai && lastChat.pictureFrameList) {
        lastChat.pictureFrameList = pictureFrameList;
        setChatList([...copyChatList.current.slice(0, -1), lastChat]);

        // 上传海报到cos
        // setAnswerStatus(EAnswerStatus.UN_ANSWER)
        uploadHandle(pictureFrameList);
      }
    }
  }, [pictureFrameList]);

  useEffect(() => {
    if (uploadedUrls.length) {
      // 拿到cos资源后，上传海报给智能体
      getAnswerResult(
        {
          imageList: JSON.stringify(uploadedUrls),
          insertHistory: {
            chatUser: EChatUser.Ai,
            bizType: EBizType.POSTER,
          },
        },
        { isSave: true },
      );
    }
  }, [uploadedUrls]);
};

export default usePictureFrame;
