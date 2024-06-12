import React, { useEffect, useRef, useState } from 'react';
import type { EChartOption, EchartsHandle } from 'taro-react-echarts';
import Echarts from 'taro-react-echarts';
import { View } from '@tarojs/components';
// import { getEcharts } from '@plugin/index';
import * as echarts from '@utils/echarts';
import dayjs from 'dayjs';

export interface IEchartsData {
  timeLength: number;
  week: string;
  locationName: string;
  dataTime: string;
  sleepDuration: number;
  waterAmount: number;
}
export interface ISleepEchartsProps {
  data: IEchartsData[];
}

function SleepEcharts({ data }: ISleepEchartsProps) {
  const echartsRef = useRef<EchartsHandle>(null);
  const copyOptions = useRef();
  const [options, setOptions] = useState<EChartOption>({});
  copyOptions.current = options;

  useEffect(() => {
    const xAxis = {
      type: 'category',
      boundaryGap: false,
      data: data.map((item) => item.dataTime),
    };
    const series = {
      data: data.map((item) => {
        const seconds = item.sleepDuration || 0;
        const minutes = dayjs.duration(seconds * 1000).asMinutes();
        return parseFloat(minutes.toFixed(2));
      }),
      type: 'line',
      smooth: true,
      showSymbol: false,
      lineStyle: {
        color: '#716AE5',
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              color: 'rgba(113, 106, 229, 0.2)', // 0% 处的颜色
            },
            {
              offset: 1,
              color: 'rgba(113, 106, 229, 0)', // 100% 处的颜色
            },
          ],
        },
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
    console.log('=options', options);
    setOptions(options);
  }, [data]);

  return (
    <View>
      {/* <Echarts echarts={getEcharts().value} option={options} ref={echartsRef} style={{ height: 260, width: '100%' }} /> */}
      <Echarts echarts={echarts} option={options} ref={echartsRef} style={{ height: 260, width: '100%' }} />
    </View>
  );
}

export default SleepEcharts;
