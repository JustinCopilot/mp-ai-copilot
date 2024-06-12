import { EStorage } from '@plugin/types';
import Taro from '@tarojs/taro';

const getToken = () => {
  return Taro.getStorageSync(EStorage.TOKEN) || '';
};

const setToken = (token: string) => {
  Taro.setStorageSync(EStorage.TOKEN, token);
};

const clearToken = () => {
  Taro.clearStorageSync();
};

export { getToken, setToken, clearToken };
