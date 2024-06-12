import React from 'react';
import type { EAnswerStatus, ECheckStatus, IChatItem } from '@plugin/components/ChatWrapper';
import type { EOperateState } from '@plugin/components/ChatOperator';
import type { ESummaryStatus } from '@plugin/components/ChatWrapper/hooks/useBeautySummary';
import type { EMicroAppIdITest, EMicroAppIdProd, IPutChatReq } from '@plugin/request/chat/type';

export interface IGetAnswerResultParams extends Omit<IPutChatReq, 'microAppId'> { }
export interface IExtraConfig {
  isSave?: boolean;
  needPutAnsker?: boolean;
  banEdit?: boolean; // 是否禁用点击内容进行重新编辑
}

export interface IChatWrapperContext {
  microAppId: EMicroAppIdProd | EMicroAppIdITest;
  answerStatus: EAnswerStatus;
  isVoice: boolean;
  ifPlayVoice: boolean;
  isGetAllChat: boolean;
  isFirstLoad: boolean;
  checkStatus: ECheckStatus;
  questionStr: string;
  chatList: IChatItem[];
  historyChatData: IChatItem[];
  currentPlayingId?: string;
  currentPlayingContent?: string;
  summaryStatus: ESummaryStatus;
  summaryUserParam: Record<string, any>;
  summaryCallbackData: any;
  summaryUserTags: string[];
  imageUploader: {
    uploadProgress: number;
    isUploading: boolean;
    uploadedUrls: string[];
    chooseImage: () => void;
    cancelUpload: () => void;
    images: string[];
  };
  showLoadingImgBlock: boolean;
  operateState: EOperateState;
  changeSummaryUserTags: (tags: string[]) => void;
  changeOperateState: (status: EOperateState) => void;
  changeCheckStatus: (status: ECheckStatus) => void;
  changeAnswerStatus: (status: EAnswerStatus) => void;
  changeSummaryCallbackData: (data: any) => void;
  changeSummaryStatus: (status: ESummaryStatus) => void;
  changeSummaryUserParam: (params: Record<string, any>) => void;
  questionStrChange: (question: string) => void;
  changeCurrentPlayingId: (id?: string) => void;
  changeCurrentPlayingContent: (content?: string) => void;
  changeIfPlayVoice: (play: boolean) => void;
  changeVoiceStatus: (voiceStatus: boolean) => void;
  queryChatList: () => void;
  setChatList: (chatList: IChatItem[]) => void;
  abortChatRequest: () => void;
  getAnswerResult: (params: IGetAnswerResultParams, extra?: IExtraConfig) => void;
  changeShowLoadingImgBlock: (status: boolean) => void;
  chatSuspendedToolPositionX: number;
  chatSuspendedToolPositionY: number;
  setChatSuspendedToolPositionX: Function;
  setChatSuspendedToolPositionY: Function;
  chatSuspendedToolShow: boolean;
  setChatSuspendedToolShow: (show: boolean) => void;
  chatSuspendedToolCopyText: string | null;
  setChatSuspendedToolCopyText?: (text: string | null) => void;
  onChatSuspendedToolShare: Function | null;
  setChatSuspendedToolShare: (share: Function | null) => void;
  onChatSuspendedToolVoicePlay?: Function | null;
  setChatSuspendedToolVoicePlay: (play: Function | null) => void;
}

export const ChatWrapperContext = React.createContext<IChatWrapperContext | null>(null);
