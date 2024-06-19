import type { FC } from 'react';
import React, { useMemo } from 'react';
import 'taro-ui/dist/style/components/tabs.scss';
import { Image, Text, View } from '@tarojs/components';
import { useReducer } from '@sub-edu/utils';
import dayjs from 'dayjs';
import { AtTabs } from 'taro-ui';
import Taro from '@tarojs/taro';
import { DEFAULT_AVATAR_BOY, DEFAULT_AVATAR_GIRL } from '@sub-edu/constants';
import { PRE_EDU_PATH } from '@common/constants';
import { DataType, EModules } from './config';
import type { State, Props, StudentInfo } from './config';
import styles from './index.module.less';
import InterestEcharts from './InterestEcharts';
import SleepEcharts from './SleepEcharts';
import WaterEcharts from './WaterEcharts';
import InfoExtractionBlock from '../InfoExtractionBlock';

export * from './config';

const initialState = {
  current: 0,
};

export interface ICurrentContentProps extends Omit<Props, 'data'> {
  data: StudentInfo;
}
const CurrentContent: FC<ICurrentContentProps> = ({
  data,
  type = DataType.notable,
  observationdetail,
  modules = Object.values(EModules),
}) => {
  const {
    avatar = '',
    studentName,
    sex,
    age,
    className,
    top5List,
    measureTime,
    height,
    weight,
    weightAssess,
    heightAssess,
    level,
    dataList,
  } = data || {};

  const testTime = `测量时间:　${measureTime ? dayjs(measureTime).format('YYYY-MM-DD') : '--'}`;
  const heightWeight = [
    {
      label: '身高',
      value: height,
      unit: 'cm',
      level: heightAssess,
    },
    {
      label: '体重',
      value: weight,
      unit: 'kg',
      level: weightAssess,
    },
    {
      label: '体型评定等级',
      value: level === 99 ? '其它' : ['偏瘦', '标准', '超重', '肥胖']?.[level as number],
    },
  ];
  const handleSelect = (observeId) => {
    Taro.navigateTo({ url: `${PRE_EDU_PATH}/jot_down_detail/index?observeId=${observeId}` });
  };
  return (
    <View className="student-info-wrap">
      <View className="info-wrap">
        {/* 基础信息 */}
        <View className="base-info-wrap">
          <Image src={avatar || (sex === 1 ? DEFAULT_AVATAR_BOY : DEFAULT_AVATAR_GIRL)} />
          <View className="base-info">
            <View className="name">{studentName}</View>
            <View>
              <Text className="age">{age || '--'}</Text>
              <Text>{className || '--'}</Text>
            </View>
          </View>
        </View>
        {/* 观察详情 */}
        {type === DataType.notable && observationdetail && (
          <InfoExtractionBlock
            showStudents={false}
            students={observationdetail.student}
            extractInfo={observationdetail.extractInfo}
          />
        )}
      </View>

      {/* 随手记列表 */}
      <View className="notable-wrap">
        <View className="title-wrap">
          <View className="module-title">关联随手记</View>
          <View className="test-time"> </View>
        </View>
        <View className="notable-list">
          {top5List?.map(({ observeId, observeTime, content }) => (
            <View className="notable-item" key={observeId || ''} onClick={() => handleSelect(observeId)}>
              <View className="time-wrap">{observeTime}</View>
              <View className="notable-content">{content}</View>
            </View>
          ))}
        </View>
      </View>
      {/* 在园数据-身高体重 */}
      {modules.includes(EModules.BODY) && (
        <View className="height-weight">
          <View className="title-wrap">
            <View className="module-title">在园数据-身高体重</View>
            <View className="test-time">{testTime}</View>
          </View>

          <View className="value-list">
            {heightWeight?.map(({ label, value, unit, level }, key) => (
              <View className="value-item" key={key}>
                <View>
                  <View className="label">{label}</View>
                  <View className="value">
                    {value || '--'}
                    {!!unit && <Text className="unit">{unit}</Text>}
                  </View>
                  {level && <View className="level">等级：{level || '--'}</View>}
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {[
        {
          title: '在园数据-幼儿兴趣',
          unit: '分钟',
          Chart: InterestEcharts,
          show: modules.includes(EModules.INTEREST),
        },
        {
          title: '在园数据-幼儿饮水',
          unit: 'ml',
          Chart: WaterEcharts,
          show: modules.includes(EModules.WATER),
        },
        {
          title: '在园数据-幼儿午睡',
          unit: '分钟',
          Chart: SleepEcharts,
          show: modules.includes(EModules.SLEEP),
        },
      ].map(({ title, unit, Chart, show }, key) => {
        const data =
          dataList?.map(({ week, dataTime, ...rest }) => ({
            ...rest,
            week: ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日']?.[week as number],
            dataTime: dataTime?.slice(5),
          })) || [];
        return (
          <View className="chart-wrap" key={key} style={{ display: show ? 'block' : 'none' }}>
            <View className="chart-header">
              <View className="module-title">{title}</View>
              <View className="unit">({unit})</View>
            </View>
            <Chart data={data} />
          </View>
        );
      })}
    </View>
  );
};
export const ReferenceDetail: FC<Props> = ({ data, type = DataType.notable, observationdetail, modules }) => {
  const [state, dispatch] = useReducer<State>(initialState);
  const { current } = state || {};
  const tabs = useMemo(() => data?.map(({ studentName }) => ({ title: studentName?.slice(0, 4) || '--' })), [data]);

  return (
    <View className={styles['container']}>
      {data?.length > 1 && (
        <AtTabs current={current} scroll tabList={tabs} onClick={(val) => dispatch('current', val)}>
          {/* {data.map((item, index) => (
            <AtTabsPane current={current} key={item?.studentId} index={index}>
              <CurrentContent data={item} type={type} />
            </AtTabsPane>
          ))} */}
        </AtTabs>
      )}
      <CurrentContent modules={modules} data={data[current]} type={type} observationdetail={observationdetail} />
    </View>
  );
};

export default ReferenceDetail;
