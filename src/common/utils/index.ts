import Taro from '@tarojs/taro';
import { EEnv, EStorage } from '@plugin/types';

export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    let r = (Math.random() * 16) | 0;
    let v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const isJsonListStringValid = (data?: string | null) => {
  return !!data && !['null', '[]', '[null]'].includes(data);
};

export const getPageInstance = (pageIndex = 0) => {
  const pages = Taro.getCurrentPages();
  const pageInstance = pages[pages.length - 1 + pageIndex];
  return pageInstance;
};

export const isProdEnv = () => {
  return (
    Taro.getStorageSync(EStorage.HOST_ENV) === EEnv.PROD // 宿主传参控制生产域名
  )
};
