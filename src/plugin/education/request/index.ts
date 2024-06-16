import http from '@plugin/utils/https';
import type { StudentInfo } from '@edu/components';
import type { Grade } from '@edu/components/archive';
import type {
  IGetListRes,
  IGetRandomNotesListReq,
  IGetRandomNotesListRes,
  IGetStuDataDetailReq,
  IObserveDetailRes,
  IGetSectorListReq,
  Sector,
  SectorContent,
  IGetMonthDataListReq,
  IgetNaviListReq
} from './type';

export const getListApi = () => {
  return http<IGetListRes[]>({ method: 'GET', url: '/xxx' });
};

// 获取归档列表
export const getRandomNotesListApi = (params?: IGetRandomNotesListReq) => {
  return http<IGetRandomNotesListRes[]>({ method: 'POST', url: '/v1/edu/observe/getList', params });
};

export const getNaviListApi = (params?: IgetNaviListReq | undefined) => {
  return http({ method: 'POST', url: '/v1/edu/observe/getNaviList', params });
};
// 根据月份获取有数据的日期
export const getMonthDataListApi = (params?: IGetMonthDataListReq) => {
  return http<string[]>({ method: 'POST', url: '/v1/edu/observe/getMonthDataList', params });
};
export const getStuDataDetailApi = (params?: IGetStuDataDetailReq) => {
  return http<StudentInfo[]>({ method: 'POST', url: '/v1/edu/observe/getStuDataDetail', params });
};
export const removeObserveApi = (params: { observeId: number }) => {
  return http({ method: 'POST', url: '/v1/edu/observe/remove', params });
};
export const getObserveDetailApi = (params: { observeId: number }) => {
  return http<IObserveDetailRes>({ method: 'POST', url: '/v1/edu/observe/get', params });
};
export const getObserveStuDetailApi = (params: { observeId: number }) => {
  return http<IObserveDetailRes>({ method: 'POST', url: '/v1/edu/observe/getStuDataDetail', params });
};
export const getResource = () => {
  return http<{ gradeList: Grade[] }>({ method: 'GET', url: '/v1/user/getResource' });
};
export const getSectorListApi = (params?: IGetSectorListReq) => {
  return http<Sector[]>({ method: 'POST', url: '/v1/edu/observe/getSectorList', params });
};

// 获取情境标签列表
export const getSituationLabelList = () => {
  return http<SectorContent[]>({ method: 'POST', url: '/v1/edu/observe/getSituationList' });
};
// 随手记-保存或修改随手记数据
export const saveOrUpdate = (params: any) => {
  return http<any>({ method: 'POST', url: '/v1/edu/observe/saveOrUpdate', params });
};
// 对会话内容进行标签
export const microAppTag = (params: any) => {
  return http<any>({ method: 'POST', url: '/v1/microApp/tag', params });
};
// 随手记-获取观察记录设置
export const getObserveSetting = () => {
  return http<any>({ method: 'GET', url: '/v1/edu/observe/setting/get' });
};
export const removeSituationApi = (params: { situationId: number }) => {
  return http({ method: 'POST', url: '/v1/edu/observe/situation/remove', params });
};
