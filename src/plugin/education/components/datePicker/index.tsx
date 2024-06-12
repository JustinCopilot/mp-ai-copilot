import React from 'react';
import type { FC } from 'react';
import { PageContainer, View } from '@tarojs/components';
import { useReducer } from '@plugin/education/utils';
import { AtCalendar } from 'taro-ui';
import 'taro-ui/dist/style/components/calendar.scss';
import './index.less';

interface Props {
  children?: React.ReactNode;
  onChange?: (value?: string) => void;
  value?: string;
  maxDate?: string;
  minDate?: string;
}
interface State {
  show?: boolean;
}
const initialState = {
  show: false,
};
export const DatePicker: FC<Props> = ({ children, onChange, value, ...rest }) => {
  const [state, dispatch] = useReducer<State>(initialState);
  const { show } = state || {};
  return (
    <View className="date-picker-container" onClick={() => dispatch('show', true)}>
      {children}
      <PageContainer show={show} position="top" round onAfterLeave={() => dispatch('show', false)}>
        <AtCalendar
          currentDate={value}
          onSelectDate={(val: any) => {
            onChange?.(val?.value?.start);
            dispatch('show', false);
          }}
          {...rest}
        />
      </PageContainer>
    </View>
  );
};

export default DatePicker;
