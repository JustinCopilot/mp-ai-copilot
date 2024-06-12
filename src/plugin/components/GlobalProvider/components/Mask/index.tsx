import React from 'react';
import { View } from '@tarojs/components';
import './index.less';

const Mask: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  return <View className="mask" onClick={onClick} />;
};

export default Mask;
