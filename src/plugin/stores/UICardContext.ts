import React from 'react';
import type { EAnswerStatus, ECheckStatus, IChatItem } from '@plugin/components/ChatWrapper';
import { EChatItemTag } from '@plugin/request/chat/type';
import type { IExtraConfig, IGetAnswerResultParams } from './ChatWrapperContext';

export interface IUIExtraConfig extends Pick<IExtraConfig, 'needPutAnsker' | 'banEdit'> {
  saveTag?: EChatItemTag;
}

export interface IAnswerOperaterConfig {
  hideAnswerOperater?: boolean; // 隐藏回复操作条
  hideVoicePlay?: boolean; // 隐藏语音播报
  hideFeedback?: boolean; // 隐藏点赞点踩
  hideReGenerator?: boolean; // 隐藏重新生成
}

export interface IUICardContext {
  chatList: IChatItem[];
  eduStates: Common;
  chatItem: IChatItem;
  isGlobalPlaying?: boolean;
  isGlobalLastAnswer: boolean;
  globalAnswerStatus?: EAnswerStatus;
  globalCheckStatus?: ECheckStatus;
  putChat: (params: IGetAnswerResultParams, extra?: IUIExtraConfig) => void;
  saveChatItem: (params: IGetAnswerResultParams, chatItem: IChatItem) => void;
  changeCurrentChatItemTag: (chatItemTag: EChatItemTag) => void;
  changeCurrentAnswerOperater: (config: IAnswerOperaterConfig) => void;
  changeCurrentPlayContent: (text: string) => void;
  changeCurrentCopyText: (text: string) => void;
}

export const UICardContext = React.createContext<IUICardContext | null>(null);
