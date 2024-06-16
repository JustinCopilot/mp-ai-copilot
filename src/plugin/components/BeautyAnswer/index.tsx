import React from 'react';
import { Text, View } from '@tarojs/components';
import { EBubbleKey, type IBubbleComponent, EChatUser } from '@plugin/request/chat/type';
import type { IChatItem } from '@plugin/components/ChatWrapper';
import { generateUUID } from '@common/utils';
import UserInfo from './UserInfo';
import Bubble from './Bubble';
import Summary from './Summary';
import './index.less';

export interface IBeautyAnswerProps {
  bubbleList?: IBubbleComponent[];
  chatContent: IChatItem['chatContent'];
  beautyUserInfo: IChatItem['beautyUserInfo'];
  summaryUserTags: IChatItem['summaryUserTags'];
  summaryUserSatisfaction: IChatItem['summaryUserSatisfaction'];
}

// 美业回访总结初始化提问
export const genBeautyInitAnswer = (beautyUserInfo: any, hasBubble?: boolean): IChatItem => {
  const ret: IChatItem = {
    chatContent: '请告诉我本次回访的方式：',
    chatUser: EChatUser.Ai,
    uniqueId: generateUUID(),
    beautyUserInfo,
    hideFeedback: true,
    hideReGenerator: true,
    // agentResponse: '{"msg":"success","code":0,"data":{"user_tags":[{"tag_value":[],"tag_name":"用户性格"},{"tag_value":[],"tag_name":"防晒习惯"},{"tag_value":[],"tag_name":"清洁习惯"},{"tag_value":["科技护肤"],"tag_name":"护肤偏好"},{"tag_value":[],"tag_name":"睡眠偏好"},{"tag_value":[],"tag_name":"吸烟行为"},{"tag_value":["偶尔饮酒"],"tag_name":"饮酒行为"},{"tag_value":["敏感性肤质"],"tag_name":"肤质类型"}],"user_satisfaction":"高"}}',
  };
  if (hasBubble) {
    ret.bubbleList = `[
      {"bubbleInfo": "电话回访", "key": "${EBubbleKey.MOBILE}"},
      {"bubbleInfo": "微信回访", "key": "${EBubbleKey.WECHAT}"},
      {"bubbleInfo": "没有联系上", "key": "${EBubbleKey.NOT_CONTACTED}"}
    ]`;
  }
  return ret;
};

const BeautyAnswer = (props: IBeautyAnswerProps) => {
  const { bubbleList, chatContent, beautyUserInfo, summaryUserTags, summaryUserSatisfaction } = props;
  return (
    <View className="beauty-answer">
      {chatContent && <Text decode>{chatContent}</Text>}
      {beautyUserInfo && <UserInfo beautyUserInfo={beautyUserInfo} />}
      {bubbleList && <Bubble bubbleList={bubbleList} />}
      {(summaryUserTags || summaryUserSatisfaction) && <Summary {...props} />}
    </View>
  );
};

export default BeautyAnswer;
