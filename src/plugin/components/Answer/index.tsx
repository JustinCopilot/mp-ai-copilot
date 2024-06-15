import React, { useContext, useMemo } from 'react';
import { Text, View } from '@tarojs/components';
import { ChatWrapperContext } from '@plugin/stores/ChatWrapperContext';
import { UICardContext } from '@plugin/stores/UICardContext';
import { EChatUser } from '@plugin/request/chat/type';
import { LoadingText } from '@plugin/components/PagIcon';
import useGetScenes from '@plugin/hooks/useGetScenes';
import { EAnswerStatus, type IChatItem } from '../ChatWrapper';
import ImageAnswer from '../ImageAnswer';
import AnswerOperater from '../AnswerOperater';
import BeautyAnswer from '../BeautyAnswer';
import EduAnswer from '../EduAnswer';
import CheckAnswer from '../CheckAnswer';
import ChatSuspendedTool from '../ChatSuspendedTool';
import ToolBar from '../ChatSuspendedTool/ToolBar';
import './index.less';
import useGetUICardContextValue from './hooks/useGetUICardContextValue';

export interface IAnswerProps {
  chatItem: IChatItem;
}

const Answer: React.FC<IAnswerProps> = ({ chatItem }) => {
  const {
    onChatSuspendedToolShare,
    onChatSuspendedToolVoicePlay,
    chatSuspendedToolCopyText,
    chatSuspendedToolShow,
    chatSuspendedToolPositionX = 0,
    chatSuspendedToolPositionY = 0,
    microAppId,
    chatList,
    answerStatus,
    changeCurrentPlayingId,
    changeIfPlayVoice,
    changeCurrentPlayingContent,
  } = useContext(ChatWrapperContext) || {};
  const { isBeautySummaryScenes, isEduKnowledgeScenes, isEduPhotoScenes, isEduBehaviorScenes } =
    useGetScenes(microAppId);

  const isLastAnswer = useMemo(() => {
    const lastAnswer = chatList?.findLast((item) => item.chatUser === EChatUser.Ai);
    return lastAnswer?.dataId === chatItem.dataId && lastAnswer?.ssdId === chatItem.ssdId;
  }, [chatList, chatItem]);
  const bubbleList = useMemo(() => {
    return chatItem.bubbleList && JSON.parse(chatItem.bubbleList);
  }, [chatItem]);
  const imageList = useMemo(() => {
    return chatItem.imageList && JSON.parse(chatItem.imageList);
  }, [chatItem]);
  const componentInParam = useMemo(() => {
    if (chatItem.componentInParam) {
      if (Array.isArray(chatItem.componentInParam)) {
        return chatItem.componentInParam[0];
      } else {
        return JSON.parse(chatItem.componentInParam)[0];
      }
    }
  }, [chatItem]);

  const handlePlayVoice = () => {
    changeIfPlayVoice?.(true);
    changeCurrentPlayingContent?.(chatItem.playContent || chatItem.chatContent);
    setTimeout(() => {
      changeCurrentPlayingId && changeCurrentPlayingId(chatItem.dataId);
    }, 100);
  };

  const uiCardContextValue = useGetUICardContextValue({ chatItem, isLastAnswer });

  return answerStatus === EAnswerStatus.STAR_ANSWER && isLastAnswer ? (
    <View className="answering">
      <LoadingText />
      {/* <xiao-c-loading-text /> */}
    </View>
  ) : (
    <View className="answer">
      <ChatSuspendedTool
        id={`ChatSuspendedTool-${chatItem.dataId}`}
        copyText={chatItem.copyText || chatItem.chatContent}
        onVoicePlay={chatItem.playContent || chatItem.chatContent ? handlePlayVoice : undefined}
      // onShare={handleShare}
      >
        {isEduKnowledgeScenes && (
          <Text decode className="answer_content">
            {chatItem.chatContent}
          </Text>
        )}
        {isBeautySummaryScenes && (
          <BeautyAnswer
            bubbleList={bubbleList}
            chatContent={chatItem.chatContent}
            beautyUserInfo={chatItem.beautyUserInfo}
            summaryUserSatisfaction={chatItem.summaryUserSatisfaction}
            summaryUserTags={chatItem.summaryUserTags}
          />
        )}
        {isEduPhotoScenes && (
          <>
            {(bubbleList || imageList || chatItem.pictureFrameList || chatItem.chatContent) && (
              <ImageAnswer
                imageList={imageList}
                bubbleList={bubbleList}
                chatContent={chatItem.chatContent}
                pictureFrameList={chatItem.pictureFrameList}
              />
            )}
            {componentInParam && <CheckAnswer componentInParam={componentInParam} isLastAnswer={isLastAnswer} />}
          </>
        )}
        <UICardContext.Provider value={uiCardContextValue}>
          {isEduBehaviorScenes && <EduAnswer chatItem={chatItem} />}
        </UICardContext.Provider>
      </ChatSuspendedTool>
      {!chatItem.hideAnswerOperater &&
        ((isLastAnswer && answerStatus === EAnswerStatus.UN_ANSWER) || !isLastAnswer) && (
          <AnswerOperater isLastAnswer={isLastAnswer} chatItem={chatItem} />
        )}
      <ToolBar
        show={chatSuspendedToolShow}
        pointX={chatSuspendedToolPositionX}
        pointY={chatSuspendedToolPositionY - 100}
        copyText={chatSuspendedToolCopyText}
        onVoicePlay={onChatSuspendedToolVoicePlay}
        onShare={onChatSuspendedToolShare}
      />
    </View>
  );
};

export default Answer;
