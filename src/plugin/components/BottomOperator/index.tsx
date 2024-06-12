import { View } from '@tarojs/components';
import type { ReactNode } from 'react';
import React, { memo } from 'react';

import './index.less';

interface IProps {
  children: ReactNode;
}

const BottomOperator = memo(({ children }: IProps) => {
  return <View className="bottom-operator">{children}</View>;
});

export default BottomOperator;
