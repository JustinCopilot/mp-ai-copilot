import React, { useContext } from 'react';
import { View } from '@tarojs/components';
import { ChatWrapperContext } from '@plugin/stores/ChatWrapperContext';
import { EChatMode } from '@plugin/request/chat/type';
import IconWrap from '../../components/IconWrap';
import './index.less';

const ReGenerator: React.FC = () => {
  const { getAnswerResult, chatList = [], summaryUserParam } = useContext(ChatWrapperContext) || {};

  const refreshHandler = () => {
    const questionStr = chatList[chatList.length - 2]?.chatContent;
    const params: {
      query: string;
      mode: EChatMode;
      repeat: boolean;
      userParam?: Record<string, any>;
    } = { query: questionStr || '', mode: EChatMode.REFRESH, repeat: true };
    if (questionStr === '生成回访总结') {
      params.userParam = summaryUserParam;
    }
    getAnswerResult?.(params);
  };

  return (
    <View className="re-generator">
      <IconWrap icon="chat_refresh" onClick={refreshHandler} />
    </View>
  );
};

export default ReGenerator;
