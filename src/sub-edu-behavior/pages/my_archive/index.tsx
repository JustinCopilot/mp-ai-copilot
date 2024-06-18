import React, { useState, useEffect, useRef } from 'react';
import Taro from '@tarojs/taro';
import type { SelectorQuery } from '@tarojs/taro';
import { View, ScrollView } from '@tarojs/components';
import { useThrottleFn } from 'ahooks';
import dayjs from 'dayjs';
import { AtCalendar, AtNavBar } from 'taro-ui';
import { TOP_BAR_HEIGHT } from '@common/constants';
import { EStorage } from '@plugin/types';
import NoData from '@plugin/components/NoData';
import { getRandomNotesListApi, getMonthDataListApi } from '@sub-edu-behavior/request';
import { IGetRandomNotesListReq, IGetRandomNotesListRes, IGetMonthDataListReq } from '@sub-edu-behavior/request/type';
import 'taro-ui/dist/style/components/calendar.scss';
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
  // 列表标题项是否滑动到顶部
  const [titleTop, setTitleTop] = useState<boolean[]>([true]);
  // 列表滚动距离
  const [scrollTop, setScrollTop] = useState(0);

  const scrollViewRef = useRef<SelectorQuery>();
  const titleBlockRef = useRef<SelectorQuery>();
  const titleTopRef = useRef<number[]>([]);

  /**
   * 请求数据列表
   * @param params 请求参数
   * @param nextPage 是否下一页
   */
  const getList = async (params?: IGetRandomNotesListReq, nextPage?: boolean) => {
    const res = await getRandomNotesListApi({
      source: currentNav,
      studentId: selectedChildData.join(),
      ...params,
    })
    if (res?.length > 0) {
      if (nextPage) {
        setDataList([...dataList, ...res]);
      } else {
        setDataList(res);
      }
    } else {
      setIsGetAllData(true);
      Taro.showToast({
        title: '暂无更多数据',
        icon: 'none',
      });
      if (!nextPage) {
        setDataList([]);
      }
    }
    // 请求到数据时先保存每个日期的titleBlock的top值，确保日历中点击指定日期时能滚动到指定位置
    titleBlockRef.current?.exec(res => {
      titleTopRef.current = res[0].map(i => i.top);
    })
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
      // setRenderDataList(filterDataList);
      titleBlockRef.current?.exec(() => {
        renderDataList.forEach((i, index) => {
          if (e.value === i.observeDate) {
            setScrollTop(titleTopRef.current?.[index] - TOP_BAR_HEIGHT! - 40);
          }
        });
      })
    } else {
      // 说明只有标识，默认列表dataList中暂时没数据，需要请求接口获取
      getList({
        dateTime: e.value
      }, false);
      handleScrollToTop();
    }
  };

  const handleMonthChange = async (e) => {
    if (selectedChildData.length === 0) {
      // 切换月份，如果是有筛选幼儿，不需要获取打点数据，走触底刷新的逻辑去更新打点数据，否则打点数据中会存在不是该幼儿的有效打点
      const res = await getMonthDataList({
        month: e.slice(0, 7),
      });
      if (res.length > 0) {
        setValidDates([...validDates, ...res.map(i => ({ value: i }))]);
      }
    }
  };

  const handleClickNav = (value: ENavType) => {
    setCurrentNav(value);
  };

  const handleScrollToTop = () => {
    scrollViewRef.current?.exec((res) => {
      const scrollView = res[0]?.node;
      scrollView?.scrollTo({ top: 0 });
    });
  }

  const handleTriggerCalendar = (date: string) => {
    if (!calendarVisible) {
      setCurrentDate(date);
    }
    setCalendarVisible(!calendarVisible)
  }

  const { run: handleScroll } = useThrottleFn(() => {
    titleBlockRef.current?.exec(res => {
      // 设置标题们是否滑动到顶部
      setTitleTop([true].concat(res[0]?.map(i => i.top - TOP_BAR_HEIGHT! < 65).slice(1)));
    })
  });

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


  Taro.useReady(() => {
    Taro.eventCenter.on('selectedChildData', (selectedData: number[]) => {
      setValidDates([]); // 如果有筛选幼儿，将有效日期置空，重新赋值该幼儿的有效日期
      setSelectedChildData(selectedData);
    });
    // 详情编辑保存触发
    Taro.eventCenter.on('detailEditSave', (source: ENavType) => {
      setTimeout(() => {
        // 加定时器是为了确保请求到更新后的内容
        const data = Taro.getStorageSync(EStorage.EDU_SELECTED_CHILD_DATA);
        getList({ source, studentId: data || '' });
        if (data) {
          Taro.removeStorageSync(EStorage.EDU_SELECTED_CHILD_DATA);
        }
      }, 1000);
    });

    scrollViewRef.current = Taro.createSelectorQuery()
      .in(Taro.getCurrentInstance().page!)
      .select('#my_archive_list_scroll_view')
      .node();
    titleBlockRef.current = Taro.createSelectorQuery()
      .in(Taro.getCurrentInstance().page!)
      .selectAll('.title-block')
      .boundingClientRect();
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

  // tab更改时置空打点数据
  useEffect(() => {
    setValidDates([]);
  }, [currentNav]);

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
        scrollTop={scrollTop}
        showScrollbar={true}
        onScroll={handleScroll}
        onScrollToLower={handleScrollToLower}
      >
        {renderDataList?.map((dateItem, dateIndex) => (
          <View className="item-by-date" key={dateItem.observeDate}>
            <TitleBlock
              ref={titleBlockRef}
              date={dateItem.observeDate}
              isLatest={titleTop[dateIndex]}
              onTriggerCalendar={(date: string) => handleTriggerCalendar(date)}
              selectedChildData={selectedChildData}
            />
            <View className="container" onClick={() => setCalendarVisible(false)}>
              {dateItem.observeList?.map((timeItem, timeIndex) => (
                <ContentBlock
                  currentNav={currentNav}
                  key={timeItem.observeId}
                  showTimeLine={timeIndex !== dateItem.observeList?.length - 1}
                  contentItem={timeItem}
                  selectedChildData={selectedChildData.join()}
                />
              ))}
            </View>
          </View>
        ))}
        {dataList?.length === 0 && <View>
          <TitleBlock
            onlyShowFilterChild
            selectedChildData={selectedChildData}
          />
          <NoData />
        </View>}
      </ScrollView>
    </View>
  );
};

export default MyArchive;
