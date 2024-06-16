import { useContext, useEffect, useMemo, useRef } from 'react';
import type { IChatItem } from '@plugin/components/ChatWrapper';
import type { IGetAnswerResultParams } from '@plugin/stores/ChatWrapperContext';
import { ChatWrapperContext } from '@plugin/stores/ChatWrapperContext';
import type { IUIExtraConfig, IAnswerOperaterConfig } from '@plugin/stores/UICardContext';
import { EChatItemTag } from '@plugin/request/chat/type';

export interface IUseGetUICardContextValueProps {
  chatItem: IChatItem;
  isLastAnswer: boolean;
}

const useGetUICardContextValue = ({ chatItem, isLastAnswer }: IUseGetUICardContextValueProps) => {
  const copyChatList = useRef<IChatItem[]>([]);
  const {
    chatList = [],
    answerStatus,
    checkStatus,
    ifPlayVoice,
    setChatList,
    getAnswerResult,
    currentPlayingId,
  } = useContext(ChatWrapperContext) || {};

  // 在确认场景下，前后dataid一样，导致从前查找出现index错误
  const currentChatItemIndex = chatList.findLastIndex((item) => item.uniqueId === chatItem.uniqueId);

  const changeCurrentChatItemTag = (chatItemTag: EChatItemTag) => {
    chatList[currentChatItemIndex] = {
      ...chatList[currentChatItemIndex],
      tag: chatItemTag,
    };
    setChatList?.([...chatList]);
  };
  const changeCurrentAnswerOperater = (config: IAnswerOperaterConfig) => {
    chatList[currentChatItemIndex] = {
      ...chatList[currentChatItemIndex],
      ...config,
    };
    setChatList?.([...chatList]);
  };
  const changeCurrentCopyText = (text: string) => {
    chatList[currentChatItemIndex] = {
      ...chatList[currentChatItemIndex],
      copyText: text,
    };
    setChatList?.([...chatList]);
  };
  const changeCurrentPlayContent = (text: string) => {
    chatList[currentChatItemIndex] = {
      ...chatList[currentChatItemIndex],
      playContent: text,
    };
    setChatList?.([...chatList]);
  };
  const putChat = (params: IGetAnswerResultParams, extra?: IUIExtraConfig) => {
    getAnswerResult?.(params, { ...extra });
  };
  const saveChatItem = (params: IGetAnswerResultParams, chatItem: IChatItem) => {
    setChatList?.([...chatList, chatItem]);
    getAnswerResult?.(params, { isSave: true });
  };

  useEffect(() => {
    copyChatList.current = chatList;
  }, [chatList]);

  const uiCardContextValue = useMemo(() => {
    return {
      chatList,
      eduStates: {},
      chatItem,
      isGlobalLastAnswer: isLastAnswer,
      isGlobalPlaying: !!(ifPlayVoice && currentPlayingId),
      globalAnswerStatus: answerStatus,
      globalCheckStatus: checkStatus,
      putChat,
      saveChatItem,
      changeCurrentChatItemTag,
      changeCurrentAnswerOperater,
      changeCurrentPlayContent,
      changeCurrentCopyText,
    };
  }, [chatItem, isLastAnswer, ifPlayVoice, currentPlayingId, answerStatus, checkStatus]);

  return uiCardContextValue;
};

export default useGetUICardContextValue;
