import React from 'react';
import { View, Image } from '@tarojs/components';
import './index.less';

interface INoDataProps {
  content?: string;
}

const NoData: React.FC<INoDataProps> = ({
  content
}) => {

  return (
    <View className='no-data'>
      <View className='img' />
      <View className='content'>{content || '暂无数据'}</View>
    </View>
  );
};

export default NoData;
