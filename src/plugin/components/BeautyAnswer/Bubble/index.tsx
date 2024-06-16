import React, { useContext, useEffect } from 'react';
import { useRouter } from '@tarojs/taro';
import { ChatWrapperContext } from '@plugin/stores/ChatWrapperContext';
import type { IChatItem } from '@plugin/components/ChatWrapper';
import { ESummaryStatus } from '@plugin/components/ChatWrapper/hooks/useBeautySummary';
import { generateUUID } from '@common/utils';
import { Button, View } from '@tarojs/components';
import { EBubbleKey, type IBubbleComponent, EChatUser } from '@plugin/request/chat/type';
import './index.less';

export interface IChatRouter {
  microAppUuid: number;
  params: any;
}

export interface IBeautyAnswerBubbleProps {
  bubbleList?: IBubbleComponent[];
}

export const CallbackModeMap = {
  [EBubbleKey.WECHAT]: '微信回访',
  [EBubbleKey.MOBILE]: '电话回访',
};

const BeautyAnswerBubble = ({ bubbleList = [] }: IBeautyAnswerBubbleProps) => {
  const router = useRouter<RouterParams<IChatRouter>>();
  const {
    imageUploader,
    chatList = [],
    getAnswerResult,
    setChatList,
    changeSummaryStatus,
    summaryCallbackData,
    changeSummaryCallbackData,
    changeSummaryUserParam,
    changeIfPlayVoice,
    summaryUserTags,
  } = useContext(ChatWrapperContext) || {};

  const handleClick = (bubble: IBubbleComponent) => {
    chatList.forEach((i) => {
      delete i.bubbleList; // 触发气泡点击后移除
    });
    changeIfPlayVoice?.(false); // 默认不需要播报语音
    if (bubble.key === EBubbleKey.NOT_CONTACTED) {
      changeSummaryStatus?.(ESummaryStatus.NEW_SESSION);
      setChatList?.([
        ...chatList,
        ...[
          {
            chatUser: EChatUser.User,
            chatContent: '没有联系上',
            uniqueId: generateUUID(),
          },
          {
            chatUser: EChatUser.Ai,
            chatContent: '未联系上顾客暂时无法生成回访总结，建议您再次跟进回访计划～',
            uniqueId: generateUUID(),
          },
        ],
      ]);
    } else {
      changeSummaryStatus?.(ESummaryStatus.NOT_SUMMARY);
      const data = getUserInfo();
      if ([EBubbleKey.WECHAT, EBubbleKey.MOBILE].includes(bubble.key)) {
        changeSummaryCallbackData?.(
          Object.assign(summaryCallbackData, {
            type: bubble.key,
          }),
        );
      }
      if (bubble.key === EBubbleKey.UNNEED) {
        const userParam = {
          job_role: '美容顾问', // 待定
          user_name: data.name,
          item_name: data.project,
          callback_cycle: data.time,
          callback_target: '专业关怀', // 待定
          callback_mode: CallbackModeMap[summaryCallbackData.type],
          callback_pictures: getCallbackPictures(chatList).map((value) => ({
            type: 1,
            value,
          })),
          counselor_summary: getCounselorSummary(chatList),
        };
        console.log('%c [ userParam ]-85', 'font-size:13px; background:pink; color:#bf2c9f;', userParam);
        getAnswerResult?.({
          query: '生成回访总结',
          userParam,
        });
        changeSummaryUserParam?.(userParam);
      } else {
        getAnswerResult?.(
          {
            query: bubble.bubbleInfo,
          },
          {
            banEdit: true,
          },
        );
      }
    }
  };

  // 获取宿主传入的用户信息
  const getUserInfo = () => {
    const data = decodeURIComponent(router.params.params || '') || '{}';
    return JSON.parse(data).data?.user || {};
  };

  const getCallbackPictures = (chatList: IChatItem[]) => {
    return processChatAfterLastCallback(chatList, (filteredChats) => {
      const images = filteredChats
        .filter((chat) => chat.chatUser === EChatUser.Image && chat.imageList)
        .flatMap((chat) => JSON.parse(chat.imageList || '[]'));
      return images;
    });
  };

  const getCounselorSummary = (chatList: IChatItem[]) => {
    return processChatAfterLastCallback(chatList, (filteredChats) => {
      const messages = filteredChats
        .filter((chat) => chat.chatUser === EChatUser.User && chat.chatContent !== '需要')
        .map((chat) => chat.chatContent);
      return messages.join('\n\n');
    });
  };

  // 筛选聊天记录中的客户补充反馈：
  // 从会话列表的末尾开始向前遍历，找到第一个“微信回访”或“电话回访”。收集后续用户的提问
  const processChatAfterLastCallback = (chatList, handleItem) => {
    const targetTypes = new Set([CallbackModeMap[EBubbleKey.WECHAT], CallbackModeMap[EBubbleKey.MOBILE]]);
    const startIndex = chatList
      .slice()
      .reverse()
      .findIndex((chat) => targetTypes.has(chat.chatContent));

    if (startIndex === -1) return '';

    const actualStartIndex = chatList.length - 1 - startIndex;
    return handleItem(chatList.slice(actualStartIndex + 1));
  };

  useEffect(() => {
    const lastChat = chatList[chatList.length - 1];
    if (lastChat?.bubbleList?.includes(EBubbleKey.WECHAT)) {
      changeSummaryStatus?.(ESummaryStatus.SELECT_RETURN_VISIT_WAY);
    } else if (lastChat?.bubbleList?.includes(EBubbleKey.NEED)) {
      changeSummaryStatus?.(ESummaryStatus.SELECT_COMMAND);
    }

    if (lastChat?.agentResponse && lastChat?.agentResponse !== '{}') {
      const res = JSON.parse(lastChat.agentResponse);
      const { user_tags = [], user_satisfaction } = res.data || {};
      changeSummaryCallbackData?.(
        Object.assign(summaryCallbackData, {
          summaryContent: lastChat.chatContent,
          satisfaction: user_satisfaction,
          tags: summaryUserTags?.length
            ? summaryUserTags
            : user_tags.reduce((acc, tag) => acc.concat(tag.tag_value), []),
          images: imageUploader?.uploadedUrls,
        }),
      );
      changeSummaryStatus?.(ESummaryStatus.RETURN_VISIT_SUMMARY_CONFIRM);
    }
  }, [chatList]);

  return (
    <View className="beauty-answer-bubble">
      {bubbleList.map((item) => (
        <Button
          style={item.key === EBubbleKey.UNNEED ? { width: 420 } : {}}
          key={item.id}
          className="operator-btn"
          onClick={() => handleClick(item)}
        >
          {item.bubbleInfo}
        </Button>
      ))}
    </View>
  );
};

export default BeautyAnswerBubble;
