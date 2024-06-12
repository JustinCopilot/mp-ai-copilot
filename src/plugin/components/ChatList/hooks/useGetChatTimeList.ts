import { useContext, useMemo } from 'react';
import { ChatWrapperContext } from '@plugin/stores/ChatWrapperContext';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import isBetween from 'dayjs/plugin/isBetween';
import localeData from 'dayjs/plugin/localeData';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import 'dayjs/locale/zh-cn';
import type { IChatItem } from '@plugin/components/ChatWrapper';

dayjs.extend(duration);
dayjs.extend(isBetween);
dayjs.extend(localeData);
dayjs.extend(localizedFormat);
dayjs.locale('zh-cn');
const now = dayjs();
const startOfDay = now.startOf('day');
const oneWeekAgo = now.subtract(1, 'week');
const currentYear = now.year();

interface IChatTimeInfo {
  chatTime: string;
  ssdId: number;
  cutOffLine?: number;
}
enum ETimeLineText {
  year = 'YYYY年MM月DD日 HH:mm',
  week = 'MM月DD日 HH:mm',
  dayAndWeek = 'dddd HH:mm',
  day = 'HH:mm',
}
const INTERVAL_MINUTE = 5;

const useGetChatTimeList = () => {
  const { historyChatData, isGetAllChat } = useContext(ChatWrapperContext) || {};
  let lastTime: Dayjs;

  function isBeforeYear(dayTime: Dayjs) {
    return dayTime.year() < currentYear;
  }
  function isBeforeWeek(dayTime: Dayjs) {
    return dayTime.isBefore(oneWeekAgo);
  }
  function isBetweenDayAndWeek(dayTime: Dayjs) {
    return dayTime.isBefore(startOfDay) && dayTime.isAfter(oneWeekAgo);
  }
  function isSameDay(dayTime: Dayjs) {
    return dayTime.isAfter(startOfDay);
  }
  function diffTime(dayTime: Dayjs, preTime: Dayjs) {
    const diffLen = preTime.diff(dayTime, 'minute');
    return diffLen >= INTERVAL_MINUTE;
  }
  function getChatTimeList(historyChatData: IChatItem[], isGetAllChat?: boolean) {
    const timeList: IChatTimeInfo[] = historyChatData
      .map((item) => ({
        chatTime: item.chatTime!,
        ssdId: item.ssdId!,
      }))
      .map((item, index) => {
        const dayTime = dayjs(item.chatTime);
        if (!lastTime) {
          lastTime = dayTime;
        } else if (diffTime(dayTime, lastTime)) {
          lastTime = dayTime;
          return {
            ...item,
            cutOffLine: index - 1,
          };
        } else if (isGetAllChat && index === historyChatData.length - 1) {
          lastTime = dayTime;
          return {
            ...item,
            cutOffLine: index,
          };
        }
        return { ...item };
      });
    const timeLineList: { [x: number]: string }[] = [];
    timeList.forEach((item) => {
      if (item.cutOffLine) {
        const { chatTime, ssdId } = timeList[item.cutOffLine];
        const dayTime = dayjs(chatTime);
        if (isBeforeYear(dayTime)) {
          timeLineList.push({
            [ssdId]: dayjs(chatTime).format(ETimeLineText.year),
          });
        }
        if (isBeforeWeek(dayTime)) {
          timeLineList.push({
            [ssdId]: dayjs(chatTime).format(ETimeLineText.week),
          });
        }
        if (isBetweenDayAndWeek(dayTime)) {
          timeLineList.push({
            [ssdId]: dayjs(chatTime).format(ETimeLineText.dayAndWeek),
          });
        }
        if (isSameDay(dayTime)) {
          timeLineList.push({
            [ssdId]: dayjs(chatTime).format(ETimeLineText.day),
          });
        }
      }
    });
    return Object.assign({}, ...timeLineList);
  }

  const chatTimeList = useMemo(() => {
    if (historyChatData) {
      return getChatTimeList(historyChatData, isGetAllChat);
    }
  }, [historyChatData, isGetAllChat]);

  return {
    chatTimeList,
  };
};

export default useGetChatTimeList;
