import React, { useContext } from 'react';
import Taro from '@tarojs/taro';
import { ChatWrapperContext } from '@plugin/stores/ChatWrapperContext';
import { EEduBehaviorTag } from '@plugin/education/interface';
import { View, ScrollView } from '@tarojs/components';
import { EAnswerStatus } from '@plugin/components/ChatWrapper';
import './index.less';

const data = [
  { label: '幼儿表现随手记', id: EEduBehaviorTag.BehaviorMemo },
  { label: '观察记录生成', id: EEduBehaviorTag.BehaviorRecord },
  { label: '观察要点指导', id: EEduBehaviorTag.BehaviorKeyPoint },
  { label: '观察分析建议', id: EEduBehaviorTag.BehaviorAnalysisSuggestion },
];

const BubbleList = () => {
  const { getAnswerResult, answerStatus } = useContext(ChatWrapperContext) || {};

  const handleClickBubble = (bubble: string) => {
    if (answerStatus !== EAnswerStatus.UN_ANSWER) {
      return Taro.showToast({
        title: '正在回复中',
        icon: 'none',
      });
    }
    getAnswerResult?.(
      { query: bubble },
      {
        banEdit: true,
      },
    );
  };

  return (
    <ScrollView className="bubble-list" scrollX scrollWithAnimation={false} enableFlex showScrollbar={false} enhanced>
      <View className="item-container">
        {data.map((item) => (
          <View className="item" key={item.id} onClick={() => handleClickBubble(item.label)}>
            {item.label}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default BubbleList;
