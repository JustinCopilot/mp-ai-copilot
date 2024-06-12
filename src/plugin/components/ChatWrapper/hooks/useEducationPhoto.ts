import { useRef } from 'react';
import { EChatUser } from '@plugin/request/chat/type';
import type { IExtraConfig, IGetAnswerResultParams } from '@plugin/stores/ChatWrapperContext';
import { generateUUID } from '@plugin/utils';
import { EAnswerStatus } from '..';
import type { IChatItem } from '..';
import useStreamToArray from './useStreamToArray';
import { dealErrorStatus, type ITransformStreamProps } from './useTransformStream';

const useEducationPhoto = () => {
  const { transformStreamToArray } = useStreamToArray();
  const aiDataId = useRef<string>();

  function getDefaultChatInfo(
    params: IGetAnswerResultParams,
    chatList: IChatItem[],
    { needPutAnsker = true }: IExtraConfig,
  ) {
    // 需要生成唯一的dataId，所以不能定义在全局
    // dataId是语音播报的唯一标识，在流式接口结束后会进行标记，所以需要暴露出去
    aiDataId.current = generateUUID();
    // 智能相册都不支持重新生成
    const NEW_ANSWER_INFO = {
      chatContent: '',
      chatUser: EChatUser.Ai,
      dataId: aiDataId.current,
      hideReGenerator: true,
    };
    const NEW_ASKER_INFO = { chatContent: params.query || '', chatUser: EChatUser.User, dataId: generateUUID() };
    const editChatInfo = [...chatList.slice(0, -2), NEW_ASKER_INFO, NEW_ANSWER_INFO];
    const refreshChatInfo = [...chatList.slice(0, -1), NEW_ANSWER_INFO];
    const normalChatInfo = !needPutAnsker
      ? [...chatList, NEW_ANSWER_INFO]
      : [...chatList, NEW_ASKER_INFO, NEW_ANSWER_INFO];
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
    let bubbleList: string | undefined;
    let componentInParam = '';
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
      bubbleList = data?.bubbleList || undefined;
      componentInParam = (data?.componentInParam && JSON.stringify(data.componentInParam)) || '';
      if (finish) {
        origin = data;
        aiDataId.current = data?.dataId;
      }
    });
    const answerText = answerTextList.join('');
    if (answerText) {
      setAnswerStatus(EAnswerStatus.ANSWERING);
    }
    if (lastChat.chatUser === EChatUser.Ai) {
      const chatContent = `${lastChat.chatContent}${answerText}`;
      setChatList([
        ...copyChatList.current.slice(0, -1),
        {
          ...origin,
          ...lastChat,
          dataId: origin?.dataId || lastChat.dataId,
          chatContent,
          labelList,
          imageList,
          bubbleList,
          componentInParam,
          origin,
        },
      ]);
    }
  }

  return {
    getDefaultChatInfo,
    transformTextStream,
  };
};

export default useEducationPhoto;
