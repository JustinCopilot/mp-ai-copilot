import React from 'react';
import { View } from '@tarojs/components';
import './index.less';

const DynamicBars: React.FC<{ isAnimating?: boolean }> = ({ isAnimating = true }) => {
  const barCount = 13;

  return (
    <View className="bar_container_2">
      {Array.from({ length: barCount }, (_, index) => (
        <View key={index} className={`bar ${isAnimating ? 'animating' : ''}`} />
      ))}
    </View>
  );
};

export default DynamicBars;
