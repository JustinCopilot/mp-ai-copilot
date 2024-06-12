/// <reference types="@tarojs/taro" />

declare module '*.png';
declare module '*.gif';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg';
declare module '*.css';
declare module '*.less';
declare module '*.scss';
declare module '*.sass';
declare module '*.styl';

declare namespace NodeJS {
  interface ProcessEnv {
    TARO_ENV: 'weapp' | 'swan' | 'alipay' | 'h5' | 'rn' | 'tt' | 'quickapp' | 'qq' | 'jd';
  }
}

declare type RouterParams<T extends Record<keyof T, string | number | undefined>> = Partial<{
  [P in keyof T]: string | undefined;
}>;

declare type Common = Record<string, any>;
declare type RequestPageType<T = {}> = Partial<T> & {
  pageNumb: number;
  pageSize: number;
};
declare interface ResponsePageType<T> {
  records: T[];
  pageNum: number;
  pageSize: number;
  total: number;
  size: number;
  pages: number;
  current: number;
}
