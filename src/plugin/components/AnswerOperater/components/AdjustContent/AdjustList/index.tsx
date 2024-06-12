import React from 'react';
import { View } from '@tarojs/components';
import './index.less';

interface IAdjustListProps {
  onClose: () => void;
  onClick: (query: string) => void;
}

export enum EAdjustType {
  POLISH = 1,
  RICH_CONTENT,
  SIMPLE_CONTENT,
}

const adjustMap = [
  { value: EAdjustType.POLISH, label: '帮我润色', query: '帮我润色上述内容' },
  { value: EAdjustType.POLISH, label: '丰富内容', query: '帮我丰富上述内容' },
  { value: EAdjustType.POLISH, label: '精简内容', query: '帮我精简上述内容' },
];

const AdjustList: React.FC<IAdjustListProps> = ({ onClick, onClose }) => {
  return (
    <View className="adjust-list">
      {adjustMap.map((i) => (
        <View onClick={() => onClick(i.query)} className="adjust-item" key={i.value}>
          {i.label}
        </View>
      ))}
      <View onClick={onClose} className="adjust-item cancel">
        取消
      </View>
    </View>
  );
};

export default AdjustList;
