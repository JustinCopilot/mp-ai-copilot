import React from 'react';
import { View } from '@tarojs/components';
import './index.less';

export interface ITestCompProps {
  name: string;
}

const TestComp: React.FC<ITestCompProps> = ({ name }) => <View className="name">TestComp: {name}</View>;

export default TestComp;
