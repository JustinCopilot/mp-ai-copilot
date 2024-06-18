import React from 'react';
import type { FC } from 'react';
import { PageContainer, View } from '@tarojs/components';
import { useReducer } from '@sub-edu-behavior/utils';
import { AtCalendar } from 'taro-ui';
import { TOP_BAR_HEIGHT } from '@common/constants';
import 'taro-ui/dist/style/components/calendar.scss';
import './index.less';

interface Props {
  children?: React.ReactNode;
  onChange?: (value?: string) => void;
  value?: string;
  maxDate?: string;
  minDate?: string;
  type?: 'notable' | 'observe';
}
interface State {
  show?: boolean;
}
const initialState = {
  show: false,
};
export const DatePicker: FC<Props> = ({ children, onChange, value, type, ...rest }) => {
  const [state, dispatch] = useReducer<State>(initialState);
  const { show } = state || {};
  return (
    <View className="date-picker-container" onClick={() => dispatch('show', true)}>
      {children}
      <PageContainer show={show} position="top" round onAfterLeave={() => dispatch('show', false)}>
        <View
          className={`at-date-picker  ${type === 'notable' && 'notable-time'}`}
          style={type === 'notable' ? { top: TOP_BAR_HEIGHT } : {}}
        >
          <AtCalendar
            currentDate={value}
            onSelectDate={(val: any) => {
              onChange?.(val?.value?.start);
              dispatch('show', false);
            }}
            {...rest}
          />
        </View>
      </PageContainer>
    </View>
  );
};

export default DatePicker;
