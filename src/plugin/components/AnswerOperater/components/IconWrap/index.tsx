import React from 'react';
import { View } from '@tarojs/components';
import './index.less';

export interface IIconWrapProps {
  icon: string;
  onClick?: () => void;
}

const IconWrap: React.FC<IIconWrapProps> = ({ icon, onClick }) => {
  return <View className={`icon ${icon}`} onClick={onClick} />;
};

export default IconWrap;
