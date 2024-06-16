import React from 'react';
import type { SelectorQuery } from '@tarojs/taro';
import { View, Navigator } from '@tarojs/components';
import { PRE_EDU_PATH } from '@plugin/constants';
import dayjs from 'dayjs';
import './index.less';

export interface ITitleBlockProps {
  isLatest?: boolean;
  onlyShowFilterChild?: boolean;
  date?: string;
  onTriggerCalendar?: (date: string) => void;
  selectedChildData?: number[];
  ref?: React.MutableRefObject<SelectorQuery | undefined>;
}

const TitleBlock: React.FC<ITitleBlockProps> = ({ onlyShowFilterChild, isLatest, date, onTriggerCalendar, selectedChildData }) => {
  const handleClickDate = () => {
    if (!isLatest || !date) return;
    onTriggerCalendar?.(date);
  };

  return (
    <View className='title-block'>
      <View className="left" onClick={handleClickDate}>
        <View className="date">{dayjs(date).format('YYYY年MM月DD日')}</View>
        {isLatest && <View className="arrow-right" />}
      </View>
      {(isLatest || onlyShowFilterChild) && (
        <Navigator
          url={`${PRE_EDU_PATH}/choose_child/index?selectedChildData=${selectedChildData?.join()}`}
          className={`filter ${selectedChildData?.length ? 'active' : ''}`}
        >
          筛选幼儿
        </Navigator>
      )}
    </View>
  );
};

export default TitleBlock;
