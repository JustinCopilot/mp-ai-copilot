import React from 'react';
import type { FC, ReactNode } from 'react';
import classnames from 'classnames';
import { View } from '@tarojs/components';
import './index.less';

interface Props {
  title: string;
  required?: boolean;
  right?: ReactNode
}
export const ModuleTitle: FC<Props> = ({ title, required = false, right }) => {
  return (
    <View className='module-title'>
      <View className={classnames('title-text', { required })} >{title}</View>
      {right}
    </View>
  )
}

export default ModuleTitle