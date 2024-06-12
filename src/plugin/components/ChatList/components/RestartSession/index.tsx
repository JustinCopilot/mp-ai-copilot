import React from 'react';
import { View } from '@tarojs/components';
import './index.less';

interface IRestartSessionProps {
  onOpenNewSession?: () => void;
}

const RestartSession: React.FC<IRestartSessionProps> = ({ onOpenNewSession }) => {
  const handleNewSession = () => {
    onOpenNewSession?.();
  };

  return (
    <View className="restart-session">
      <View className="re-icon" />
      <View onClick={handleNewSession}>重新开始会话</View>
    </View>
  );
};

export default RestartSession;
