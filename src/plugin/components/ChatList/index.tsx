import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, View } from '@tarojs/components';
import { ChatWrapperContext } from '@plugin/stores/ChatWrapperContext';
import { EChatUser, EMicroAppIdITest, EMicroAppIdProd, type IGetPresetRes } from '@plugin/request/chat/type';
import { ESummaryStatus } from '@plugin/components/ChatWrapper/hooks/useBeautySummary';
import useGetScenes from '@plugin/hooks/useGetScenes';
import { TOP_BAR_HEIGHT, PRE_PLUGIN_PATH } from '@plugin/constants';
import { useThrottleFn } from 'ahooks';
import type { SelectorQuery } from '@tarojs/taro';
import Taro, { useReady } from '@tarojs/taro';
import { getPageInstance } from '@plugin/utils';
import './index.less';
import Asker from '../Asker';
import Answer from '../Answer';
import ImageDisplay from '../ImageDisplay';
import Guide, { EGuideType } from './components/Guide';
import RestartSession from './components/RestartSession';
import PresetQuestion from '../PresetQuestion';
import { EOperateState } from '../ChatOperator';
import { EAnswerStatus, ECheckStatus, IChatItem } from '../ChatWrapper';
import ImageLoading from '../ImageLoading';
import useGetChatTimeList from './hooks/useGetChatTimeList';

interface IChatListProps {
  presetData?: IGetPresetRes;
  guideDataId: string;
  onOpenNewSession?: () => void;
}

const guideMap = {
  [EMicroAppIdITest.EDU_KNOWLEDGE]: EGuideType.BASE,
  [EMicroAppIdProd.EDU_KNOWLEDGE]: EGuideType.BASE,
  [EMicroAppIdITest.EDU_PHOTO]: EGuideType.EDU_PHOTO,
  [EMicroAppIdProd.EDU_PHOTO]: EGuideType.EDU_PHOTO,
  [EMicroAppIdITest.EDU_BEHAVIOR]: EGuideType.EDU_BEHAVIOR,
  [EMicroAppIdProd.EDU_BEHAVIOR]: EGuideType.EDU_BEHAVIOR,
};

const ChatList: React.FC<IChatListProps> = ({ presetData, guideDataId, onOpenNewSession }) => {
  const scrollViewRef = useRef<SelectorQuery>();
  const isScrollToTop = useRef(false);
  const {
    microAppId,
    isFirstLoad,
    isVoice,
    answerStatus,
    chatList,
    isGetAllChat,
    checkStatus,
    summaryStatus,
    operateState,
    queryChatList,
    showLoadingImgBlock,
  } = useContext(ChatWrapperContext) || {};

  const [newSessionTag, setNewSessionTag] = useState({});
  const [scrollTop, setScrollTop] = useState(9999999999);
  const isAnswer = answerStatus !== EAnswerStatus.UN_ANSWER;
  const { chatTimeList } = useGetChatTimeList();
  const { isBeautySummaryScenes, isEduBehaviorScenes } = useGetScenes(microAppId);
  const chatData = useMemo(() => {
    if (chatTimeList && chatList) {
      return chatList.map((item) => {
        return {
          ...item,
          chatTimeLine: chatTimeList[item.ssdId || ''],
        };
      });
    }
  }, [chatTimeList, chatList]);

  useEffect(() => {
    // @TODO: 新会话标识不生效排查
    if ((checkStatus === ECheckStatus.NEW_SESSION || summaryStatus === ESummaryStatus.NEW_SESSION) && chatData) {
      const lastChat = chatData[chatData.length - 1];
      setNewSessionTag({
        [lastChat.dataId]: true,
      });
    }
  }, [chatData, checkStatus, summaryStatus]);

  // 聊天列表右下角是否显示「重新开始会话」
  const isShowRestartSession = useMemo(() => {
    return (
      microAppId &&
      operateState &&
      !isAnswer &&
      isBeautySummaryScenes &&
      [
        EOperateState.VOICE_REST,
        EOperateState.TEXT_REST,
        EOperateState.TEXT_ENTER,
        EOperateState.RETURN_VISIT_SUMMARY_CONFIRM,
        EOperateState.SELECT_COMMAND,
      ].includes(operateState)
    );
  }, [microAppId, operateState, isAnswer, isBeautySummaryScenes]);

  const presetQuestionList = useMemo(() => {
    const lastChat = chatList?.[chatList.length - 1];
    if (isAnswer || (chatList?.length && !lastChat?.labelList)) return;
    if (lastChat?.labelList) {
      return JSON.parse(lastChat.labelList);
    }
    return presetData?.query;
  }, [isAnswer, chatList, presetData]);

  const { run: scrollToUpperHandler } = useThrottleFn((topEvent) => {
    if (isAnswer || isGetAllChat) return;
    console.log('topEvent', topEvent);
    scrollViewRef.current?.exec((res) => {
      const scrollView = res[0]?.node;
      scrollView?.scrollTo({ top: 2 });
      isScrollToTop.current = true;
    });
    queryChatList?.();
  });

  // 幼教行为观察查看数据引用详情
  const handleGoCheckDataWith = (chatItem: IChatItem) => {
    const { checkDataReferenceSign, eduBehaviorUserParams } = chatItem;
    const studentIds = eduBehaviorUserParams?.student?.map((item) => item.studentId).join(',');
    if (checkDataReferenceSign === 'jot_down_reference_detail') {
      const currentPage = getPageInstance();
      currentPage.setData({
        observationdetail: eduBehaviorUserParams,
      });
      Taro.navigateTo({ url: `${PRE_PLUGIN_PATH}/jot_down_reference_detail/index?studentIds=${studentIds}` });
    } else if (checkDataReferenceSign === 'data_reference_detail') {
      const { detailData = [] } = JSON.parse(chatItem?.agentResponse || '{}')?.data || {};
      const top3IdList: number[] = [];
      detailData?.forEach((item) => {
        item.top3List?.forEach((topItem) => {
          top3IdList.push(topItem?.observeId);
        });
      });
      const correlateId = [...new Set(top3IdList)].join(',');
      Taro.navigateTo({
        url: `${PRE_PLUGIN_PATH}/data_reference_detail/index?source=1&studentIds=${studentIds}&observeDate=${eduBehaviorUserParams?.extractInfo?.date}&correlateId=${correlateId}`,
      });
    }
  }

  useReady(() => {
    scrollViewRef.current = Taro.createSelectorQuery()
      .in(Taro.getCurrentInstance().page!)
      .select('#chat_list_scroll_view')
      .node();
  });
  useEffect(() => {
    // ai问答流式输出时，强制置底
    if (isAnswer && chatData) {
      setScrollTop(Date.now());
    }
  }, [isAnswer, chatData]);
  useEffect(() => {
    if (!isAnswer) {
      // 不能跟上面的副作用合并，当下拉加载时更新 ChatList 会触发 !isAnswer 条件，导致页面滚动
      // 当 isAnswer 从回答中转成非回答状态时，置底
      setScrollTop(Date.now());
    }
  }, [isAnswer]);
  useEffect(() => {
    // 当历史记录包含图片等需要响应时间的数据时，需设置延迟置底，当下拉加载时，无需置底
    if (!isScrollToTop.current) {
      setTimeout(() => {
        setScrollTop(Date.now());
        isScrollToTop.current = false;
      }, 1000);
    }
  }, [chatData]);
  useEffect(() => {
    if (checkStatus === ECheckStatus.NEW_SESSION) {
      setScrollTop(Date.now());
    }
  }, [checkStatus]);

  return (
    <View className="chat_list">
      {isVoice && <View className="chat_list_mask" />}
      {!isFirstLoad && (
        <ScrollView
          id="chat_list_scroll_view"
          className="chat_list_scroll_view"
          scrollY
          scrollWithAnimation
          scrollTop={scrollTop}
          upperThreshold={100}
          enhanced
          showScrollbar={false}
          onScrollToUpper={scrollToUpperHandler}
        >
          {isGetAllChat && (
            <Guide
              type={guideMap[microAppId!] || EGuideType.BASE}
              chatContent={presetData?.describe || ''}
              dataId={guideDataId}
            />
          )}
          {chatData?.map((chatItem, index) => {
            return (
              <View
                key={chatItem.dataId + chatItem.chatUser}
                className={`chat_list_chat_item ${index === chatData.length - 1 ? 'last' : ''}`}
              >
                {chatItem.chatTimeLine && <View className="chat_list_chat_item_time">{chatItem.chatTimeLine}</View>}
                {chatItem.chatUser === EChatUser.User && chatItem.chatContent && (
                  <View className="chat_list_chat_item_asker">
                    <Asker chatItem={chatItem} />
                  </View>
                )}
                {chatItem.chatUser === EChatUser.Ai && (
                  <View className="chat_list_chat_item_answer">
                    <Answer chatItem={chatItem} />
                  </View>
                )}
                {chatItem.chatUser === EChatUser.Image && chatItem.tempImageList && (
                  <View className="chat_list_chat_item_answer">
                    <ImageDisplay imageList={chatItem.tempImageList} />
                  </View>
                )}
                {chatItem.dataId && newSessionTag?.[chatItem.dataId] && (
                  <View className="new_session">已开启新会话</View>
                )}
                {chatItem.checkDataReferenceSign && <View className={`check-data-reference ${index === chatData.length - 1 ? 'last' : ''}`} onClick={() => handleGoCheckDataWith(chatItem)}>
                  <View className='left-icon' />
                  <View>查看数据引用详情</View>
                  <View className='right-icon' />
                </View>}
              </View>
            );
          })}
          {showLoadingImgBlock && <ImageLoading />}
          {presetQuestionList && <PresetQuestion presetQuestionList={presetQuestionList} />}

          {/* 重新开始会话 */}
          {isShowRestartSession && <RestartSession onOpenNewSession={onOpenNewSession} />}
          <View
            style={{
              height: `${(operateState && [EOperateState.TEXT_REST, EOperateState.TEXT_ENTER].includes(operateState)
                ? 90
                : 125) +
                (isShowRestartSession ? 40 : 0) +
                (isEduBehaviorScenes ? 50 : 0) +
                (TOP_BAR_HEIGHT! + 40)
                }px`,
            }}
          />
        </ScrollView>
      )}
    </View>
  );
};

export default ChatList;