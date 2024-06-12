import React, { useState, useEffect, useRef } from 'react';
import Taro from '@tarojs/taro';
import type { SelectorQuery } from '@tarojs/taro';
import { getPageInstance } from '@plugin/utils';
import { View, ScrollView } from '@tarojs/components';
import { useThrottleFn } from 'ahooks';
import dayjs from 'dayjs';
import { AtCalendar, AtNavBar } from 'taro-ui';
import { TOP_BAR_HEIGHT } from '@plugin/constants';
import NoData from '@plugin/components/NoData';
import { getRandomNotesListApi, getMonthDataListApi } from '@edu/request';
import { IGetRandomNotesListReq, IGetRandomNotesListRes, IGetMonthDataListReq } from '@edu/request/type';
// import 'taro-ui/dist/style/components/calendar.scss';
import 'taro-ui/dist/style/components/nav-bar.scss';
import 'taro-ui/dist/style/components/icon.scss';
import TitleBlock from './components/TitleBlock';
import ContentBlock from './components/ContentBlock';
import './index.less';

enum ENavType {
  OBSERVATION_RECORD = 1,
  WITH_NOTES = 2,
}
const navList = [
  { label: '随手记', value: ENavType.WITH_NOTES },
  { label: '观察记录', value: ENavType.OBSERVATION_RECORD },
];

const MyArchive = () => {
  // 日历弹窗是否显示
  const [calendarVisible, setCalendarVisible] = useState(false);
  // 有数据的日期列表
  const [validDates, setValidDates] = useState<{ value: string }[]>([]);
  // 当前选中的日期
  const [currentDate, setCurrentDate] = useState<string>();
  // 当前tab
  const [currentNav, setCurrentNav] = useState<ENavType>(ENavType.WITH_NOTES);
  // 触底刷新时加载下一页数据，是否已全部加载完
  const [isGetAllData, setIsGetAllData] = useState(false);
  // 是否已请求过最新数据的日期的所属月份 的标记有数据的日期
  // const [isGetLatestMonthData, setIsGetLatestMonthData] = useState(false);
  // 请求的有数据的数据列表
  const [dataList, setDataList] = useState<IGetRandomNotesListRes[]>([]);
  // 选中某一天会渲染的列表
  const [renderDataList, setRenderDataList] = useState<IGetRandomNotesListRes[]>([]);
  // 筛选的幼儿数据
  const [selectedChildData, setSelectedChildData] = useState<number[]>([]);
  const scrollViewRef = useRef<SelectorQuery>();

  /**
   * 请求数据列表
   * @param params 请求参数
   * @param nextPage 是否下一页
   * @param setRenderList 是否直接设置renderList
   */
  const getList = async (params?: IGetRandomNotesListReq, nextPage?: boolean, setRenderList?: boolean) => {
    const res = await getRandomNotesListApi({
      source: currentNav,
      studentId: selectedChildData.join(),
      ...params,
    })
    if (res?.length > 0) {
      if (setRenderList) {
        setRenderDataList(res.slice(0, 1));
      } else if (nextPage) {
        setDataList([...dataList, ...res]);
      } else {
        setDataList(res);
      }
    } else {
      setIsGetAllData(true);
    }
  }
  const getMonthDataList = async (params?: IGetMonthDataListReq) => {
    const res = await getMonthDataListApi({
      source: currentNav,
      ...params,
    })
    if (res?.length > 0) {
      // 对比默认的数据列表中的日期，过滤掉已经存在的日期
      return res.filter(i => !dataList.find(j => j.observeDate === i)).reverse();
    }
    return [];
  }

  const handleDayClick = async (e) => {
    setCurrentDate(e.value);
    setTimeout(() => {
      setCalendarVisible(false);
    }, 200);
    const filterDataList = dataList.filter(i => i.observeDate === e.value)
    if (filterDataList.length > 0) {
      // 说明有在默认列表dataList中
      setRenderDataList(filterDataList);
    } else {
      // 说明只有标识，默认列表dataList中暂时没数据，需要请求接口获取
      getList({
        dateTime: e.value
      }, false, true);
    }
    handleScrollToTop();
  };

  const handleMonthChange = async (e) => {
    const res = await getMonthDataList({
      month: e.slice(0, 7),
    });
    if (res.length > 0) {
      setValidDates([...validDates, ...res.map(i => ({ value: i }))]);
    }
  };

  const handleClickNav = (value: ENavType) => {
    setCurrentNav(value);
    setSelectedChildData([]);
  };

  const handleScrollToTop = () => {
    scrollViewRef.current?.exec((res) => {
      const scrollView = res[0]?.node;
      scrollView?.scrollTo({ top: 0 });
    });
  }

  const { run: handleScrollToLower } = useThrottleFn(() => {
    /**
     * 不需要触底加载：
     * (1)已经加载完全部数据
     * (2)渲染列表和请求列表列表数量不一致，说明用户点击了某一天的数据
     */
    if (!isGetAllData && renderDataList.length === dataList.length) {
      getList({
        dateTime: dayjs(dataList[dataList.length - 1].observeDate).subtract(1, 'day').format('YYYY-MM-DD')
      }, true);
    }
  });

  Taro.useDidShow(() => {
    const currentPage = getPageInstance();
    if (currentPage.data.isRefresh) {
      currentPage.setData({ isRefresh: false });
      getList();
    }
  });

  Taro.useReady(() => {
    Taro.eventCenter.on('selectedChildData', (selectedData: number[]) => {
      setSelectedChildData(selectedData);
    });
    scrollViewRef.current = Taro.createSelectorQuery()
      .in(Taro.getCurrentInstance().page!)
      .select('#my_archive_list_scroll_view')
      .node();
  });

  useEffect(() => {
    getList();
    setIsGetAllData(false);
    handleScrollToTop();
  }, [currentNav, selectedChildData]);

  useEffect(() => {
    setRenderDataList(dataList);
    setCurrentDate(dataList[0]?.observeDate);
    setValidDates([...validDates, ...dataList.map((i) => ({ value: i.observeDate }))]);
  }, [dataList]);

  return (
    <View className="my-archive" style={{ paddingTop: TOP_BAR_HEIGHT }}>
      <AtNavBar border={false} leftIconType="chevron-left" color="#1E222F" onClickLeftIcon={() => Taro.navigateBack()}>
        <View className="nav-bar-header">
          {navList.map((i) => (
            <View
              className={`item ${i.value === currentNav ? 'active' : ''}`}
              key={i.value}
              onClick={() => handleClickNav(i.value)}
            >
              {i.label}
            </View>
          ))}
        </View>
      </AtNavBar>
      <View className="calendar" style={{ display: calendarVisible ? 'block' : 'none', top: TOP_BAR_HEIGHT }}>
        <AtCalendar
          onDayClick={handleDayClick}
          onMonthChange={handleMonthChange}
          currentDate={currentDate}
          maxDate={Date.now()}
          marks={validDates}
          validDates={validDates}
        />
      </View>
      <ScrollView
        className="list"
        id="my_archive_list_scroll_view"
        scrollY
        scrollWithAnimation
        lowerThreshold={500}
        enhanced
        showScrollbar={true}
        onScrollToLower={handleScrollToLower}
      >
        {renderDataList?.map((dateItem, dateIndex) => (
          <View className="item-by-date" key={dateItem.observeDate}>
            <TitleBlock
              date={dateItem.observeDate}
              isLatest={dateIndex === 0}
              onTriggerCalendar={() => setCalendarVisible(!calendarVisible)}
              selectedChildData={selectedChildData}
            />
            <View className="container" onClick={() => setCalendarVisible(false)}>
              {dateItem.observeList?.map((timeItem, timeIndex) => (
                <ContentBlock
                  isLatest={dateIndex === 0 && timeIndex === 0}
                  currentNav={currentNav}
                  key={timeItem.observeId}
                  showTimeLine={timeIndex !== dateItem.observeList?.length - 1}
                  contentItem={timeItem}
                />
              ))}
            </View>
          </View>
        ))}
        {dataList?.length === 0 && <NoData />}
      </ScrollView>
    </View>
  );
};

export default MyArchive;
