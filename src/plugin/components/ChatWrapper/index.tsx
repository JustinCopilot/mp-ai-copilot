import React, { useEffect, useMemo, useRef, useState } from 'react';
import Taro, { useDidShow } from '@tarojs/taro';
import { View } from '@tarojs/components';
import type { IExtraConfig, IGetAnswerResultParams } from '@plugin/stores/ChatWrapperContext';
import { ChatWrapperContext } from '@plugin/stores/ChatWrapperContext';
import { useRequest } from 'ahooks';
import { EChatMode, EChatUser, EBubbleKey, EBizType } from '@plugin/request/chat/type';
import type { IChatListRes } from '@plugin/request/chat/type';
import { getHistoryChatApi, getPresetApi, interruptSessionApi, putResetApi } from '@plugin/request';
import { getBaseUrl } from '@plugin/utils/https';
import { getToken } from '@plugin/utils/token';
import type { IPictureFrameList } from '@plugin/hooks/useDrawPhoto';
import { generateUUID, getPageInstance, isJsonListStringValid } from '@plugin/utils';
import { genBeautyInitAnswer } from '@plugin/components/BeautyAnswer';
import { EOperateState } from '@plugin/components/ChatOperator';
import useImageUploader from '@plugin/hooks/useImageUploader';
import useGetScenes from '@plugin/hooks/useGetScenes';
import { EPageFrom } from '@plugin/types';
import ChatList from '../ChatList';
import ChatOperator from '../ChatOperator';
import useTransformStream from './hooks/useTransformStream';
import useBeautySummary, { ESummaryStatus } from './hooks/useBeautySummary';
import './index.less';
import usePictureFrame from './hooks/usePictureFrame';

interface IChatWrapper {
  microAppId: number;
  params?: any;
}
export interface IChatItem extends Partial<IChatListRes> {
  chatUser: EChatUser;
  chatContent: string;
  dataId: string;
  pictureFrameList?: IPictureFrameList[];
  beautyUserInfo?: Record<string, any>;
  tempImageList?: string; // 本地临时图片地址渲染
  hideAnswerOperater?: boolean; // 隐藏回复操作条
  hideVoicePlay?: boolean; // 隐藏语音播报
  hideFeedback?: boolean; // 隐藏点赞点踩
  hideReGenerator?: boolean; // 隐藏重新生成
  summaryUserTags?: string[]; // 总结标签编辑暂时保存，调整内容时需要复用
  summaryUserSatisfaction?: string; // 总结满意度，调整内容时需要复用
  tag?: string; // 归档状态
  copyText?: string;
  playContent?: string;
  origin?: Partial<IChatListRes>;
  checkDataReferenceSign?: string; // 幼教行为观察「查看数据引用详情跳转url标识」
  eduBehaviorUserParams?: Record<string, any>; // 幼教行为观察「查看数据引用详情传参」
  banEdit: boolean; // 是否禁用点击内容进行重新编辑
}
export enum EAnswerStatus {
  UN_ANSWER,
  STAR_ANSWER,
  ANSWERING,
}

export enum ECheckStatus {
  UN_CHECK,
  CHECKING,
  NEW_SESSION,
}

export const UN_SUPPORT_TEXT = '小程序端暂不支持此类消息，请在app中查看';
const guideDataId = generateUUID(); // 引导会话id，用于初始化会话时播放语音

const ChatWrapper: React.FC<IChatWrapper> = ({ microAppId, params }) => {
  const [questionUUID, setQuestionUUID] = useState('');
  const [questionStr, setQuestionStr] = useState('');
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [isVoice, setIsVoice] = useState(false);
  const [ifPlayVoice, setIfPlayVoice] = useState(true);
  const [isGetAllChat, setIsGetAllChat] = useState(false);
  const [checkStatus, setCheckStatus] = useState<ECheckStatus>(ECheckStatus.UN_CHECK);
  const [answerStatus, setAnswerStatus] = useState(EAnswerStatus.UN_ANSWER);
  const [chatList, setChatList] = useState<IChatItem[]>([]);
  const [historyChatData, setHistoryChatData] = useState<IChatItem[]>([]);
  const [showLoadingImgBlock, setShowLoadingImgBlock] = useState<boolean>(false);
  const [operateState, setOperateState] = useState<EOperateState>(EOperateState.VOICE_REST);
  const copyChatList = useRef<IChatItem[]>([]);
  const chatRequestRef = useRef<Taro.RequestTask<any>>();
  const [pagenation, setPagenation] = useState({
    pageNumb: 1,
    pageSize: 20,
    total: 0,
  });

  const { isBeautySummaryScenes, isEduPhotoScenes } = useGetScenes(microAppId);
  const { getDefaultChatInfo, transformStream } = useTransformStream(microAppId);
  const {
    summaryStatus,
    setSummaryStatus,
    summaryCallbackData,
    setSummaryCallbackData,
    summaryUserParam,
    setSummaryUserParam,
    summaryUserTags,
    setSummaryUserTags,
  } = useBeautySummary();

  const imageUploader = useImageUploader();

  // 当前播放的音频会话
  const [currentPlayingId, setCurrentPlayingId] = useState<string>();
  const [currentPlayingContent, setCurrentPlayingContent] = useState<string>();
  const { data: presetData } = useRequest(() => getPresetApi({ microAppId }));
  const { data: historyData, run: getHistoryChat } = useRequest(getHistoryChatApi, { manual: true });

  // 悬浮工具条
  const [chatSuspendedToolPositionX, setChatSuspendedToolPositionX] = useState(0);
  const [chatSuspendedToolPositionY, setChatSuspendedToolPositionY] = useState(0);
  const [chatSuspendedToolShow, setChatSuspendedToolShow] = useState(false);
  const [chatSuspendedToolCopyText, setChatSuspendedToolCopyText] = useState<string | null>(null);
  const [onChatSuspendedToolVoicePlay, setChatSuspendedToolVoicePlay] = useState<Function | null>(null);
  const [onChatSuspendedToolShare, setChatSuspendedToolShare] = useState<Function | null>(null);

  const concatHistoryChat = () => {
    if (historyData) {
      if (isFirstLoad) {
        changeIfPlayVoice(false);
        setIsFirstLoad(false);
      }
      const { records, total, pageNum, pageSize } = historyData;
      const recordsData = records
        .map((item) => {
          item['origin'] = JSON.parse(JSON.stringify(item));
          // 针对json字符串进行异常过滤判断
          ['agentResponse', 'bubbleList', 'fileList', 'imageList', 'componentInParam'].forEach((key) => {
            if (!isJsonListStringValid(item[key])) {
              item[key] = null;
            }
          });
          if (isEduPhotoScenes) {
            // 智能相册以下场景数据暂不支持
            if (item.fileList || item.agentResponse || item.bubbleList?.includes(EBubbleKey.DISTRIBUTE)) {
              item.chatContent = UN_SUPPORT_TEXT;
              item.imageList = '';
            }
          }
          // 自定义海报数据类型不显示回答可操作项
          item['hideAnswerOperater'] = item.bizType === EBizType.POSTER;
          return item;
        })
        .filter((item) => {
          return !(item.chatUser === EChatUser.User && item.bubbleList);
        });
      setHistoryChatData([...historyChatData, ...recordsData]);
      setChatList([...recordsData.reverse(), ...chatList]);
      if (isFirstLoad && records?.length === 0) {
        changeCurrentPlayingId(guideDataId); // 初始化播放引导
        setChatList([]);
      }
      setPagenation({
        total,
        pageSize,
        pageNumb: pageNum + 1,
      });
      setIsGetAllChat(pageNum * pageSize >= total);
    }
  };

  const questionStrChange = (question: string) => {
    setQuestionUUID(String(new Date().getTime()));
    setQuestionStr(question);
  };
  const getAnswerResult = (params: IGetAnswerResultParams, extra?: IExtraConfig) => {
    console.log('触发流式对话', params);
    setCheckStatus(ECheckStatus.UN_CHECK);
    const { isSave } = extra || {};
    const { aiDataId, refreshChatInfo, normalChatInfo, editChatInfo } = getDefaultChatInfo(params, chatList, {
      ...extra,
    });
    if (!isSave) {
      if (params.mode === EChatMode.REFRESH) {
        setChatList(refreshChatInfo);
      } else if (params.mode === EChatMode.EDIT) {
        setChatList(editChatInfo);
      } else {
        setChatList(normalChatInfo);
      }
    }
    setAnswerStatus(EAnswerStatus.STAR_ANSWER);
    chatRequestRef.current = Taro.request({
      method: 'POST',
      url: `${getBaseUrl()}/v1/microApp/chat`,
      enableChunked: true,
      responseType: 'text',
      data: { microAppId, ...params },
      // timeout: CHAT_TIMEOUT,
      header: {
        Authorization: getToken(),
      },
      complete() {
        setAnswerStatus(EAnswerStatus.UN_ANSWER);
        // dataId是语音播报的唯一标识，所以在设置初始化会话记录的时候需要赋值
        changeCurrentPlayingId(aiDataId.current);
      },
      fail(error) {
        let chatContent = '请求异常';
        if (error.errMsg === 'request:fail abort') {
          chatContent = '你已停止生成回答';
        }
        const lastChat = copyChatList.current[copyChatList.current.length - 1];
        lastChat.chatContent = lastChat.chatContent || chatContent;
        setChatList([...copyChatList.current.slice(0, -1), lastChat]);
      },
    });
    chatRequestRef.current.onChunkReceived((stream) => {
      if (!isSave) {
        transformStream({
          stream,
          copyChatList,
          setAnswerStatus,
          setChatList,
        });
      }
    });
  };
  const abortChatRequest = () => {
    chatRequestRef.current?.abort();
    interruptSessionApi({ microAppId });
    const lastChat = copyChatList.current[copyChatList.current.length - 1];
    if (lastChat.chatUser === EChatUser.Ai) {
      lastChat.chatContent = lastChat.chatContent || '你已停止生成回答';
      lastChat.labelList = '[]';
      setChatList([...copyChatList.current.slice(0, -1), lastChat]);
    }
  };

  const changeIfPlayVoice = (play: boolean) => {
    setIfPlayVoice(play);
  };
  const changeVoiceStatus = (voiceStatus: boolean) => {
    setIsVoice(voiceStatus);
  };
  const changeCurrentPlayingId = (playingId?: string, content?: string) => {
    setCurrentPlayingId(playingId);
    setCurrentPlayingContent(content);
  };

  const queryChatList = () => {
    if (isGetAllChat) {
      return;
    }
    if (isBeautySummaryScenes) {
      getHistoryChat({
        microAppId,
        ...{
          pageNumb: 9999,
          pageSize: 20,
        },
      });
    } else {
      getHistoryChat({ microAppId, ...pagenation });
    }
  };
  const handleSend = (questionStr: string, mode: EChatMode) => {
    const params: {
      query: string;
      mode: EChatMode;
      userParam?: Record<string, any>;
    } = { query: questionStr || '', mode };
    if (questionStr === '生成回访总结') {
      params.userParam = summaryUserParam;
    }
    getAnswerResult(params);
  };
  const openNewSessionHandle = () => {
    // 美业回访总结新会话报错，暂时不调用会话重置
    if (isBeautySummaryScenes) {
      setAnswerStatus(EAnswerStatus.ANSWERING);
      if (isFirstLoad) setIsFirstLoad(false);
      setChatList([...chatList, genBeautyInitAnswer(getBeautyUserInfo(), true)]);
      setIsGetAllChat(true);
    } else {
      if (!isEduPhotoScenes) {
        putResetApi({ microAppId });
      }
      setCheckStatus(ECheckStatus.NEW_SESSION);
    }
  };

  // 获取美业用户信息
  const getBeautyUserInfo = () => {
    const data = JSON.parse(decodeURIComponent(params))?.data;
    return data?.user;
  };
  const handleTouchStart = () => {
    setChatSuspendedToolShow(false);
  };

  const contextValue = useMemo(() => {
    return {
      microAppId,
      questionStr,
      answerStatus,
      isVoice,
      isGetAllChat,
      isFirstLoad,
      checkStatus,
      chatList,
      historyChatData,
      currentPlayingId,
      currentPlayingContent,
      ifPlayVoice,
      summaryStatus,
      summaryCallbackData,
      summaryUserParam,
      showLoadingImgBlock,
      operateState,
      imageUploader,
      summaryUserTags,
      changeCheckStatus: setCheckStatus,
      changeAnswerStatus: setAnswerStatus,
      changeIfPlayVoice,
      changeCurrentPlayingId,
      changeCurrentPlayingContent: setCurrentPlayingContent,
      questionStrChange,
      changeVoiceStatus,
      queryChatList,
      setChatList,
      getAnswerResult,
      abortChatRequest,
      changeSummaryStatus: setSummaryStatus,
      changeSummaryCallbackData: setSummaryCallbackData,
      changeSummaryUserParam: setSummaryUserParam,
      changeShowLoadingImgBlock: setShowLoadingImgBlock,
      changeOperateState: setOperateState,
      changeSummaryUserTags: setSummaryUserTags,
      chatSuspendedToolPositionX,
      chatSuspendedToolPositionY,
      setChatSuspendedToolPositionX,
      setChatSuspendedToolPositionY,
      chatSuspendedToolCopyText,
      setChatSuspendedToolCopyText,
      chatSuspendedToolShow,
      setChatSuspendedToolShow,
      onChatSuspendedToolVoicePlay,
      setChatSuspendedToolVoicePlay,
      onChatSuspendedToolShare,
      setChatSuspendedToolShare,
    };
  }, [
    microAppId,
    questionStr,
    answerStatus,
    isVoice,
    isGetAllChat,
    isFirstLoad,
    checkStatus,
    chatList,
    historyChatData,
    currentPlayingId,
    ifPlayVoice,
    summaryStatus,
    imageUploader,
    showLoadingImgBlock,
    operateState,
    summaryUserTags,
  ]);

  useEffect(() => {
    concatHistoryChat();
  }, [historyData]);
  useEffect(() => {
    copyChatList.current = chatList;
    // @TODO: 美业暂时关闭重新编辑
    // if (![EMicroAppIdProd.BEAUTY_SUMMARY, EMicroAppIdITest.BEAUTY_SUMMARY].includes(microAppId)) {
    const lastChat = chatList[chatList.length - 1];
    if (isEduPhotoScenes) {
      setCheckStatus(lastChat?.componentInParam ? ECheckStatus.CHECKING : ECheckStatus.UN_CHECK);
    }
    // }
  }, [chatList]);

  useEffect(() => {
    // 美业回访总结每次进来都是新的会话
    if (isBeautySummaryScenes) {
      if (isFirstLoad) setIsFirstLoad(false);
      setTimeout(() => {
        const initItem = genBeautyInitAnswer(getBeautyUserInfo(), true);
        setChatList([initItem]);
        setIsGetAllChat(true);
        setSummaryStatus(ESummaryStatus.SELECT_RETURN_VISIT_WAY);
        changeCurrentPlayingId?.(initItem.dataId);
      }, 500); // 延迟500ms，先渲染一次录音图标，防止变形
    }
    queryChatList();
  }, []);
  useDidShow(() => {
    const currentPage = getPageInstance();
    if (currentPage.data.from === EPageFrom.CHAT_EXTENSION) {
      // 如果是从更多操作页面back回来的，需要重新请求
      setIsFirstLoad(true);
      getHistoryChat({
        microAppId,
        pageNumb: 1,
        pageSize: 20,
      });
    }
    if (currentPage.data.from === EPageFrom.EDIT_OBSERVATION) {
      console.log('归档，信息补充操作');
    }
  });

  // 从图文生成编辑页面跳回会话页面处理事件
  usePictureFrame({ setAnswerStatus, setChatList, getAnswerResult, copyChatList });

  return (
    // @ts-ignore
    <ChatWrapperContext.Provider value={contextValue}>
      <View className="chat_wrapper" onTouchStart={handleTouchStart}>
        <ChatList presetData={presetData} guideDataId={guideDataId} onOpenNewSession={openNewSessionHandle} />
        <ChatOperator
          externalQuestionUUID={questionUUID}
          externalQuestionStr={questionStr}
          onSend={handleSend}
          onOpenNewSession={openNewSessionHandle}
        />
      </View>
    </ChatWrapperContext.Provider>
  );
};

export default ChatWrapper;
