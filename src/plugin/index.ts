import type { PAG } from 'libpag-miniprogram/types/types';
/**
 * 对PAGInit进行一次封装，同时触发PAGInit时，实际仅调用一次
 * @returns pagInitPromise:Promise<PAG>
 */
let initLock = false;
let pagInitPromise: Promise<PAG>;
let echarts = { value: undefined };

export const pagInit = async (getPag): Promise<PAG> => {
  if (initLock) return pagInitPromise;
  initLock = true;
  pagInitPromise = await getPag?.();
  return pagInitPromise;
};
export const echartsInit = async (cb) => {
  const value = await cb?.();
  echarts.value = value;
};

export const getPagInitPromise = () => {
  return pagInitPromise;
};
export const getEcharts = () => {
  return echarts;
};
