import React, { useEffect, useRef, useState } from 'react';
import type { EChartOption, EchartsHandle } from 'taro-react-echarts';
import Echarts from 'taro-react-echarts';
import { View } from '@tarojs/components';
// import { getEcharts } from '@plugin/index';
import * as echarts from '@utils/echarts';
import dayjs from 'dayjs';

export interface IEchartsData {
  timeLength?: number;
  week?: string;
  locationName?: string;
  dataTime?: string;
  sleepDuration?: number;
  waterAmount?: number;
}
export interface IInterestEchartsProps {
  data: IEchartsData[];
}

function InterestEcharts({ data }: IInterestEchartsProps) {
  const echartsRef = useRef<EchartsHandle>(null);
  const copyOptions = useRef();
  const [options, setOptions] = useState<EChartOption>({});
  copyOptions.current = options;

  useEffect(() => {
    const xAxis = {
      type: 'category',
      data: data.map((item) => item.dataTime),
    };
    const series = {
      data: data.map((item, index) => {
        const seconds = item.timeLength || 0;
        const minutes = dayjs.duration(seconds * 1000).asMinutes();
        const value = parseFloat(minutes.toFixed(2));
        return [index, value, item.locationName || '--'];
      }),
      type: 'bar',
      barWidth: 20,
      itemStyle: {
        borderRadius: [20, 20, 0, 0],
      },
      label: {
        show: true,
        position: 'top',
        formatter: '{@[2]}',
      },
    };
    const options = {
      tooltip: {
        trigger: 'axis',
        show: true,
        confine: true,
      },
      xAxis,
      yAxis: {
        type: 'value',
      },
      series: series,
    };
    console.log('InterestEcharts=options', options);
    setOptions(options);
  }, [data]);

  return (
    <View>
      {/* <Echarts echarts={getEcharts().value} option={options} ref={echartsRef} style={{ height: 260, width: '100%' }} /> */}
      <Echarts echarts={echarts} option={options} ref={echartsRef} style={{ height: 260, width: '100%' }} />
    </View>
  );
}

export default InterestEcharts;
