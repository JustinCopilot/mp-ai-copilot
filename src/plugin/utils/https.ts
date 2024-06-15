import Taro, { request } from '@tarojs/taro';
import { EEnv, EStorage } from '@plugin/types';
import { getToken } from './token';
import { transformRouterParams } from './router';

const boundary = '----WebKitFormBoundaryX2UFH67x5M0xltNB';
const contentTypes = {
  json: 'application/json; charset=utf-8',
  urlencoded: 'application/x-www-form-urlencoded; charset=utf-8',
  multipart: `multipart/form-data; boundary=${boundary}`,
};
const defaultOptions = {
  timeout: 60000,
  credentials: 'include', // 设置H5端携带Cookie
  dataType: 'json', // 返回的数据结构
};
const envUrlList = {
  [EEnv.ITEST]: 'https://itest.clife.net/assistant',
  [EEnv.PROD]: 'https://cms.clife.cn/assistant',
};
export const isProduction = process.env.NODE_ENV === 'production' && process.env.TARO_APP_API_ENV === 'production';
console.log('isProduction', isProduction);
export const isProdEnv = () => {
  return Taro.getStorageSync(EStorage.HOST_ENV) === EEnv.PROD;
};
console.log('isProdEnv', isProdEnv());
// export const BASE_URL = 'https://itest.clife.net/assistant';
export const getBaseUrl = (url?: string) => {
  let BASE_URL = '';
  if (url?.startsWith('https://')) {
    BASE_URL = '';
  } else {
    const env = Taro.getStorageSync(EStorage.HOST_ENV) || EEnv.PROD;
    BASE_URL = envUrlList[env];
  }
  return BASE_URL;
};

interface OptionParams {
  url: string;
  method: 'OPTIONS' | 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE';
  params?: object;
  options?: any;
  contentType?: 'json' | 'urlencoded' | 'multipart';
  showLoading?: boolean;
  usePostUrlParams?: boolean;
}

let loadingLength = 0;

const http = <T = any>({
  url,
  method,
  params,
  options = {},
  contentType = 'json',
  showLoading = true,
  usePostUrlParams,
}: OptionParams): Promise<T> => {
  if (!url) {
    const error = new Error('请传入url');
    return Promise.reject(error);
  }
  console.log('url:', url);
  if (showLoading) {
    loadingLength++;
    Taro.showLoading({ title: '加载中', mask: true });
  }
  let fullUrl = `${getBaseUrl()}${url}`;
  if (usePostUrlParams && params) {
    const postUrlParams = transformRouterParams(params);
    fullUrl = fullUrl + '?' + postUrlParams;
  }
  const token = getToken();

  const newOptions = {
    ...defaultOptions,
    header: {
      Accept: 'application/json',
      'Content-Type': options.header?.['Content-Type'] || contentTypes[contentType],
      'X-Requested-With': 'XMLHttpRequest',
      Authorization: token,
      ...options.header,
    },
    ...options,
    data: usePostUrlParams ? {} : params,
    method,
  };

  return request({ url: fullUrl, ...newOptions })
    .then((response) => {
      console.log('response==', response);
      const { data } = response;
      const { code, msg } = data || {};
      if (code !== 0) {
        Taro.showToast({
          title: msg || '网络异常',
          icon: 'error',
          duration: 2000,
        });
        if (code === 401 && !isProduction) {
          setTimeout(() => {
            Taro.navigateTo({ url: '/pages/index/index' });
          }, 2000);
        }
        return Promise.reject(data.msg);
      }
      return Promise.resolve(data.data);
    })
    .catch((error) => {
      return Promise.reject(error);
    })
    .finally(() => {
      if (showLoading && loadingLength > 0) {
        loadingLength--;
        Taro.hideLoading();
      }
    });
};

export default http;
