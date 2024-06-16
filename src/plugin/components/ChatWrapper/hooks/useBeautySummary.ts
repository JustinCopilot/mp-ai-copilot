import { useRef, useState } from 'react';
import { EChatUser } from '@plugin/request/chat/type';
import type { IGetAnswerResultParams } from '@plugin/stores/ChatWrapperContext';
import { generateUUID } from '@plugin/utils';
import { EAnswerStatus } from '..';
import type { IChatItem } from '..';
import useStreamToArray from './useStreamToArray';
import { dealErrorStatus, type ITransformStreamProps } from './useTransformStream';

export enum ESummaryStatus {
  SELECT_RETURN_VISIT_WAY = 6, // 选择回访方式
  NEW_SESSION = 7, // 重新开始会话
  SELECT_COMMAND = 8, // 选择指令
  RETURN_VISIT_SUMMARY_CONFIRM = 9, // 回访总结确认
  NOT_SUMMARY = 99, // 不处于总结状态
}

const useBeautySummary = () => {
  const { transformStreamToArray } = useStreamToArray();
  const [summaryStatus, setSummaryStatus] = useState<ESummaryStatus>(ESummaryStatus.NOT_SUMMARY);
  const [summaryCallbackData, setSummaryCallbackData] = useState({}); // 回访总结生成数据
  const [summaryUserParam, setSummaryUserParam] = useState({}); // 存储首次发送的用户参数，供重新生成使用
  const [summaryUserTags, setSummaryUserTags] = useState<string[]>([]); // 存储智能体返回的用户标签
  const aiDataId = useRef<string>();

  function getDefaultChatInfo(params: IGetAnswerResultParams, chatList: IChatItem[]) {
    // 需要生成唯一的dataId，所以不能定义在全局
    // dataId是语音播报的唯一标识，在流式接口结束后会进行标记，所以需要暴露出去
    aiDataId.current = generateUUID();
    const NEW_ANSWER_INFO = { chatContent: '', chatUser: EChatUser.Ai, uniqueId: aiDataId.current };
    const NEW_ASKER_INFO = { chatContent: params.query || '', chatUser: EChatUser.User, uniqueId: generateUUID() };
    const editChatInfo = [...chatList.slice(0, -2), NEW_ASKER_INFO, NEW_ANSWER_INFO];
    const refreshChatInfo = [...chatList.slice(0, -1), NEW_ANSWER_INFO];
    const normalChatInfo = [...chatList, NEW_ASKER_INFO, NEW_ANSWER_INFO];
    return {
      aiDataId,
      refreshChatInfo,
      editChatInfo,
      normalChatInfo,
    };
  }

  function transformTextStream({ stream, copyChatList, setAnswerStatus, setChatList }: ITransformStreamProps) {
    const streamDataArr = transformStreamToArray(stream);
    if (!streamDataArr) return;

    let answerTextList: string[] = [];
    let labelList = '[]';
    let imageList = '[]';
    let bubbleList = '[]';
    let componentInParam = '[]';
    let agentResponse = '{}';
    let origin: any = null;
    console.log('streamDataArr==', streamDataArr);
    const lastChat = copyChatList.current[copyChatList.current.length - 1];

    const err = dealErrorStatus({ copyChatList, lastChat, setChatList, streamDataArr });
    if (err.isError) return;

    streamDataArr.forEach((item) => {
      const { content, data, finish } = item;
      answerTextList.push(content || '');
      labelList = data?.labelList || '[]';
      imageList = data?.imageList || '[]';
      bubbleList = data?.bubbleList || '[]';
      agentResponse = data?.agentResponse || '{}';
      componentInParam = (data?.componentInParam && JSON.stringify(data.componentInParam)) || '[]';
      if (finish) {
        origin = data;
        aiDataId.current = data?.uniqueId;
      }
    });
    const answerText = answerTextList.join('');
    if (answerText) {
      // 为了触发屏幕滚动到最底部
      setAnswerStatus?.(EAnswerStatus.ANSWERING);
    }
    if (lastChat.chatUser === EChatUser.Ai) {
      const chatContent = `${lastChat.chatContent}${answerText.replace(
        /\\n/g,
        `
      `,
      )}`;
      lastChat.chatContent = chatContent;
      lastChat.labelList = labelList;
      lastChat.imageList = imageList;
      lastChat.bubbleList = bubbleList;
      lastChat.componentInParam = componentInParam;
      // 先拿接口返回的智能体数据，再拿历史回复的智能体数据（一般是在润色内容时）
      lastChat.agentResponse =
        agentResponse && agentResponse !== '{}'
          ? agentResponse
          : copyChatList.current[copyChatList.current.length - 3]?.agentResponse;

      // 保存智能体返回的评价数据
      const data = JSON.parse(lastChat.agentResponse || '{}').data;
      if (data) {
        const fixTags = data.user_tags?.reduce((acc, tag) => acc.concat(`${tag.tag_name}-${tag.tag_value}`), []);
        lastChat.summaryUserTags = summaryUserTags?.length
          ? summaryUserTags
          : copyChatList.current[copyChatList.current.length - 3]?.summaryUserTags || fixTags;
        lastChat.summaryUserSatisfaction =
          copyChatList.current[copyChatList.current.length - 3]?.summaryUserSatisfaction || data.user_satisfaction;
      }

      setChatList([
        ...copyChatList.current.slice(0, -1),
        {
          ...origin,
          ...lastChat,
          uniqueId: origin?.uniqueId || lastChat.uniqueId,
          origin,
        },
      ]);
    }

    if (lastChat.agentResponse && lastChat.agentResponse !== '{}') {
      setSummaryStatus(ESummaryStatus.RETURN_VISIT_SUMMARY_CONFIRM);
    }
  }

  return {
    summaryStatus,
    setSummaryStatus,
    summaryCallbackData,
    setSummaryCallbackData,
    summaryUserParam,
    setSummaryUserParam,
    summaryUserTags,
    setSummaryUserTags,
    getDefaultChatInfo,
    transformTextStream,
  };
};

export default useBeautySummary;
