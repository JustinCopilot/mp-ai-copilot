import React from 'react';
import dayjs from 'dayjs';
import { View, Navigator } from '@tarojs/components';
import { TOP_BAR_HEIGHT } from '@plugin/constants';
import './index.less';

export interface ITitleBlockProps {
  isLatest: boolean;
  date: string;
  onTriggerCalendar: () => void;
  selectedChildData: number[];
}

const TitleBlock: React.FC<ITitleBlockProps> = ({ isLatest, date, onTriggerCalendar, selectedChildData }) => {
  const handleClickDate = () => {
    if (!isLatest) return;
    onTriggerCalendar();
  };

  return (
    <View className={`title-block ${isLatest ? 'fixed' : ''}`} style={{ top: isLatest ? TOP_BAR_HEIGHT! + 46 : 0 }}>
      <View className="left" onClick={handleClickDate}>
        <View className="date">{dayjs(date).format('YYYY年MM月DD日')}</View>
        {isLatest && <View className="arrow-right" />}
      </View>
      {isLatest && (
        <Navigator
          url={`plugin://aiPlugin/choose_child?selectedChildData=${selectedChildData.join()}`}
          className={`filter ${selectedChildData?.length ? 'active' : ''}`}
        >
          筛选幼儿
        </Navigator>
      )}
    </View>
  );
};

export default TitleBlock;
