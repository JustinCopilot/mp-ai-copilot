import type { RequestTask } from '@tarojs/taro';
import type { IPutChatRes } from '@plugin/request/chat/type';
import { EMicroAppIdITest, EMicroAppIdProd } from '@plugin/request/chat/type';
import type { EAnswerStatus, IChatItem } from '..';
import useEducationQuestion from './useEducationQuestion';
import useEducationPhoto from './useEducationPhoto';
import useBeautySummary from './useBeautySummary';
import useCommonScenes from './useCommonScenes';

export interface ITransformStreamProps {
  stream: RequestTask.onChunkReceived.CallbackResult;
  setAnswerStatus: (value: React.SetStateAction<EAnswerStatus>) => void;
  setChatList: (value: React.SetStateAction<IChatItem[]>) => void;
  copyChatList: React.MutableRefObject<IChatItem[]>;
}

export interface IDealErrorStatus extends Pick<ITransformStreamProps, 'copyChatList' | 'setChatList'> {
  lastChat: IChatItem;
  streamDataArr: IPutChatRes[];
}
export function dealErrorStatus({ lastChat, streamDataArr, copyChatList, setChatList }: IDealErrorStatus) {
  if (streamDataArr[0].errCode !== 0) {
    const { data } = streamDataArr[0];
    let origin: any = data;
    setChatList([
      ...copyChatList.current.slice(0, -1),
      {
        ...origin,
        ...lastChat,
        dataId: data?.dataId || lastChat.dataId,
        chatContent: '加载失败',
        origin,
      },
    ]);
    return { isError: true };
  }
  return { isError: false };
}

const useTransformStream = (microAppId: number) => {
  const { getDefaultChatInfo, transformTextStream } = useCommonScenes();
  const {
    getDefaultChatInfo: getDefaultChatInfoByEduKnowledge,
    transformTextStream: transformTextStreamByEduKnowledge,
  } = useEducationQuestion();
  const { getDefaultChatInfo: getDefaultChatInfoByEduPhoto, transformTextStream: transformTextStreamByEduPhoto } =
    useEducationPhoto();
  const { getDefaultChatInfo: getDefaultChatInfoByBeauty, transformTextStream: transformTextStreamByBeauty } =
    useBeautySummary();

  switch (microAppId) {
    case EMicroAppIdITest.EDU_KNOWLEDGE:
    case EMicroAppIdProd.EDU_KNOWLEDGE:
      return {
        getDefaultChatInfo: getDefaultChatInfoByEduKnowledge,
        transformStream: transformTextStreamByEduKnowledge,
      };
    case EMicroAppIdITest.EDU_PHOTO:
    case EMicroAppIdProd.EDU_PHOTO:
      return {
        getDefaultChatInfo: getDefaultChatInfoByEduPhoto,
        transformStream: transformTextStreamByEduPhoto,
      };
    case EMicroAppIdITest.BEAUTY_SUMMARY:
    case EMicroAppIdProd.BEAUTY_SUMMARY:
      return {
        getDefaultChatInfo: getDefaultChatInfoByBeauty,
        transformStream: transformTextStreamByBeauty,
      };
    case EMicroAppIdITest.EDU_BEHAVIOR:
    case EMicroAppIdProd.EDU_BEHAVIOR:
      return {
        getDefaultChatInfo: getDefaultChatInfo,
        transformStream: transformTextStream,
      };

    default:
      return {
        getDefaultChatInfo,
        transformStream: transformTextStream,
      };
  }
};

export default useTransformStream;
