import React from 'react';
import { View } from '@tarojs/components';
import './index.less';

const TOTAL_STAR = 5;

export interface IStarProps {
  rating: number;
}

const Star = ({ rating }: IStarProps) => {
  return (
    <View className="star-rating">
      {[...Array(TOTAL_STAR)].map((star, index) => {
        return <View key={index} className={`star ${index < rating ? '' : 'off'}`} />;
      })}
    </View>
  );
};

export default Star;
