import React, { useContext } from 'react';
import { View } from '@tarojs/components';
import { ChatWrapperContext } from '@plugin/stores/ChatWrapperContext';
import './index.less';

interface IPresetQuestion {
  presetQuestionList: string[];
}

const PresetQuestion: React.FC<IPresetQuestion> = ({ presetQuestionList }) => {
  const { getAnswerResult, changeIfPlayVoice } = useContext(ChatWrapperContext) || {};

  function clickQuestionHandler(question: string) {
    changeIfPlayVoice?.(false);
    getAnswerResult?.({ query: question });
  }

  return (
    <View className="preset_question">
      {presetQuestionList.map((item, index) => {
        return (
          <View className="preset_question_item" key={index} onClick={() => clickQuestionHandler(item)}>
            <View className="preset_question_item_left" />
            <View className="preset_question_item_text">{item}</View>
            <View className="preset_question_item_right" />
          </View>
        );
      })}
    </View>
  );
};

export default PresetQuestion;
