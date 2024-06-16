import type { ReactNode } from 'react';
import React from 'react';
import { View } from '@tarojs/components';
import './index.less';

export interface IReferenceDetailItemProps {
  title: string;
  subTitle?: string;
  children: ReactNode;
}

const ReferenceDetailItem = ({ title, subTitle, children }: IReferenceDetailItemProps) => {
  return (
    <View className="reference-detail-item">
      <View className="header">
        <View className="left">
          <View className="icon" />
          {title}
        </View>
        <View className="right">{subTitle}</View>
      </View>
      <View className="content">{children}</View>
    </View>
  );
};

export default ReferenceDetailItem;
