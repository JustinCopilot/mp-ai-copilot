import React, { useContext } from 'react';
import { GlobalContext } from '@plugin/stores/GlobalContext';
import { ChatWrapperContext } from '@plugin/stores/ChatWrapperContext';
import { View } from '@tarojs/components';
import AdjustList from './AdjustList/index';
import './index.less';

const AdjustContent: React.FC = () => {
  const { getAnswerResult } = useContext(ChatWrapperContext) || {};
  const globalContext = useContext(GlobalContext);

  const handleChat = (query) => {
    getAnswerResult?.({ query });
    onClose();
  };
  const onClose = () => {
    globalContext?.hideBottomDialog();
  };

  const handleShowAdjustModal = () => {
    globalContext?.setBottomDialogContent(<AdjustList onClose={onClose} onClick={(query) => handleChat(query)} />);
    globalContext?.showBottomDialog();
  };

  return (
    <View className="adjust-content" onClick={handleShowAdjustModal}>
      调整内容
    </View>
  );
};

export default AdjustContent;
