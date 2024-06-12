import React from 'react';
import type { FC } from 'react';
import { View } from '@tarojs/components';
import { DatePicker } from '@edu/components';
import type { ChildProps } from '@edu/components';
import dayjs from 'dayjs';
import classNames from 'classnames';
import ModuleTitle from '../module-title';
import './index.less';

/** 观察时间 */
export const ObserveTime: FC<ChildProps> = ({ dispatch, state }) => {
  const { observeTime } = state || {};
  return (
    <View className="observe-time-container">
      <ModuleTitle title="观察时间" required />

      <DatePicker
        onChange={(val) => dispatch('observeTime', val)}
        value={observeTime}
        maxDate={dayjs().format('YYYY/MM/DD')}
      >
        <CommonValue value={observeTime || '请选择'} holder={!observeTime} />
      </DatePicker>
    </View>
  );
};
/** 家长是否可见 */
export const ParentVisible: FC<ChildProps> = ({ dispatch, state }) => {
  const { parentVisible, showParentVisible } = state || {};
  if (!showParentVisible) return null;
  return (
    <View className="parent-visible-container">
      <ModuleTitle title="家长可见" />
      <CommonValue value={parentVisible ? '是' : '否'} onClick={() => dispatch('parentVisible', !parentVisible)} />
    </View>
  );
};
export const CommonValue: FC<{
  value?: string;
  holder?: boolean;
  onClick?: () => void;
}> = ({ value = '', holder = false, onClick }) => {
  return (
    <View className="common-value-content" onClick={onClick}>
      <View className={classNames('value-text', { holder })}>{value}</View>
      <View className="at-icon at-icon-chevron-right" />
    </View>
  );
};

export default ObserveTime;
