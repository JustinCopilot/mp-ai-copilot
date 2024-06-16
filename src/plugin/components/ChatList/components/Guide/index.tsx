import React, { useContext, useMemo } from 'react';
import { View } from '@tarojs/components';
import Answer from '@plugin/components/Answer';
import { ChatWrapperContext } from '@plugin/stores/ChatWrapperContext';
import useGetScenes from '@plugin/hooks/useGetScenes';
import { EChatUser } from '@plugin/request/chat/type';
import './index.less';

export enum EGuideType {
  BASE = 'base',
  SEARCH = 'search',
  KNOWLEDGE = 'knowledge',
  REPORT = 'report',
  WATCH = 'watch',
  EDU_PHOTO = 'edu_photo',
  EDU_BEHAVIOR = 'edu_behavior',
}

interface IGuide {
  chatContent: string;
  type: EGuideType;
  uniqueId: string;
}

// const guideTitleMap = {
//   [EGuideType.BASE]: '我是小C老师',
//   [EGuideType.SEARCH]: '这里是幼儿数据查询',
//   [EGuideType.KNOWLEDGE]: '这里是幼教知识百事通',
//   [EGuideType.REPORT]: '这里是幼儿报告生成',
//   [EGuideType.WATCH]: '这里是幼儿观察记录',
// };

const Guide: React.FC<IGuide> = ({ chatContent, type, uniqueId }) => {
  const { microAppUuid } = useContext(ChatWrapperContext) || {};
  const { isBeautySummaryScenes, isEduKnowledgeScenes, isEduPhotoScenes, isEduBehaviorScenes } =
    useGetScenes(microAppUuid);
  const guideInfo = useMemo(() => {
    if (!microAppUuid) {
      return {};
    }
    if (isEduKnowledgeScenes || isEduPhotoScenes) {
      return {
        title: '老师您好',
      };
    }
    if (isBeautySummaryScenes) {
      return {
        title: 'Hi',
        content: '我是你的回访助手！',
      };
    }
    if (isEduBehaviorScenes) {
      return {
        title: '老师，你好！',
        content: '我是幼儿行为观察助手',
      };
    }
    return {};
  }, [isEduKnowledgeScenes, isBeautySummaryScenes, isEduPhotoScenes, isEduBehaviorScenes, microAppUuid]);

  const content = useMemo(() => {
    if (isBeautySummaryScenes) {
      return '我可以基于您的回访内容，为您智能生成回访总结。回访总结中将包括回访过程中的关键信息、用户满意度和顾客标签等';
    }
    if (isEduBehaviorScenes) {
      return '你可以通过随手记的方式快速记录孩子的行为表现，也可以基于个性需求智能生成完整的行为观察记录。同时，可以基于某观察场景，推荐老师观察的要点指导、回应策略或指导建议。';
    }
    return chatContent;
  }, [chatContent, isBeautySummaryScenes, isEduBehaviorScenes]);

  return (
    <View className="chat_list_guide">
      <View className={`chat_list_guide_bg chat_list_guide_bg_${type}`}>
        {guideInfo.title && <View className="title">{guideInfo.title}</View>}
        {guideInfo.content && <View className="content">{guideInfo.content}</View>}
      </View>
      <View className="chat_list_chat_item_answer">
        <Answer chatItem={{ chatContent: content, uniqueId, chatUser: EChatUser.Ai }} />
      </View>
    </View>
  );
};

export default Guide;
