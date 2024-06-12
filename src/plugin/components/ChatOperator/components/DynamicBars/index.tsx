import React, { useMemo } from 'react';
import { View } from '@tarojs/components';
import './index.less';

const DynamicBars: React.FC<{
  barCount?: number;
  isAnimating?: boolean;
}> = ({ barCount = 7, isAnimating = true }) => {
  // 避免在每次渲染时重新计算高度和延迟
  const bars = useMemo(() => {
    return Array.from({ length: barCount }, (_, index) => {
      const baseDelay = -1; // 基础延迟时间，确保动画能循环
      const animationDelay = `${baseDelay + index / barCount}s`;

      // 生成10px到30px之间的随机高度
      const height = 10 + 20 * Math.random();

      return {
        animationDelay,
        height: `${height}px`,
      };
    });
  }, [barCount]);

  return (
    <View className="bar_container">
      {bars.map((bar, index) => (
        <View
          key={index}
          className="bar"
          style={{
            animationDelay: bar.animationDelay,
            animationPlayState: isAnimating ? 'running' : 'paused',
            height: bar.height,
          }}
        />
      ))}
    </View>
  );
};

export default DynamicBars;
