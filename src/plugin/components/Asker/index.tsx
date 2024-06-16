import React, { useContext, useMemo } from 'react';
import { View } from '@tarojs/components';
import { ChatWrapperContext } from '@plugin/stores/ChatWrapperContext';
import { EChatUser } from '@plugin/request/chat/type';
import useGetScenes from '@plugin/hooks/useGetScenes';
import { EAnswerStatus, ECheckStatus, type IChatItem } from '../ChatWrapper';
import './index.less';
import ImageContent, { EType } from '../ImageContent';
import { EOperateState } from '../ChatOperator';

interface IAskerProps {
  chatItem: IChatItem;
}

const Asker: React.FC<IAskerProps> = ({ chatItem }) => {
  const { microAppUuid, chatList, answerStatus, isVoice, checkStatus, questionStrChange, changeOperateState } =
    useContext(ChatWrapperContext) || {};

  const { isBeautySummaryScenes, isEduKnowledgeScenes, isEduPhotoScenes, isEduBehaviorScenes } =
    useGetScenes(microAppUuid);
  const isLastAsker = useMemo(() => {
    // 过滤出最后一个可编辑的 asker
    if (chatList) {
      const lastAsker = chatList.findLast(
        (item, index) => item.chatUser === EChatUser.User && !chatItem.imageList && index >= chatList.length - 1 - 1,
      );
      return lastAsker?.uniqueId === chatItem.uniqueId;
    }
    return false;
  }, [chatList, chatItem]);
  const disablePress = useMemo(() => {
    return (
      answerStatus !== EAnswerStatus.UN_ANSWER ||
      isVoice ||
      !isLastAsker ||
      checkStatus === ECheckStatus.CHECKING ||
      chatItem.banEdit
    );
  }, [answerStatus, isVoice, isLastAsker, checkStatus]);

  function longPressHandler() {
    changeOperateState?.(EOperateState.TEXT_ENTER);
    !disablePress && questionStrChange?.(chatItem.chatContent);
  }
  // const bubbleList = useMemo(() => {
  //   return chatItem.bubbleList && JSON.parse(chatItem.bubbleList);
  // }, [chatItem]);
  const imageList = useMemo(() => {
    return chatItem.imageList && JSON.parse(chatItem.imageList);
  }, [chatItem]);

  return (
    <View
      className={`asker ${!disablePress ? 'asker_last' : ''} ${isEduPhotoScenes && imageList ? 'upload-img' : ''}`}
      onClick={longPressHandler}
    >
      {(isEduKnowledgeScenes || isBeautySummaryScenes || isEduBehaviorScenes) && chatItem.chatContent}
      {isEduPhotoScenes && (
        <View className={`photo-asker `}>
          {chatItem.chatContent}
          {/* {bubbleList && bubbleList[0]?.bubbleInfo} */}
          {imageList && <ImageContent imageArray={imageList} renderType={EType.RESULT_POP} maxShow={9} />}
        </View>
      )}
    </View>
  );
};

export default Asker;
