import http from '@common/utils/https';
import type {
  EMicroAppUuid,
  IEduPhotoModelRes,
  IGetHistoryChatReq,
  IGetMicroListRes,
  IGetPresetReq,
  IGetPresetRes,
  IPutChatReq,
  IPutFeedbackReq,
  IPutResetReq,
  ISetTagReq,
  TGetHistoryChatRes,
} from './type';

export const getMicroListApi = () => {
  return http<IGetMicroListRes[]>({ method: 'GET', url: '/v1/microApp/applet/list' });
};

export const getHistoryChatApi = (params: IGetHistoryChatReq) => {
  return http<TGetHistoryChatRes>({ method: 'GET', url: '/v1/microApp/getHistoryChat', params });
};

export const getPresetApi = (params: IGetPresetReq) => {
  return http<IGetPresetRes>({ method: 'GET', url: '/v1/microApp/preset', params });
};

export const putChatApi = (params: IPutChatReq) => {
  return http({
    method: 'POST',
    url: '/v1/microApp/chat',
    params,
    options: {
      enableChunked: true,
      responseType: 'text',
    },
  });
};
export const putFeedbackApi = (params: IPutFeedbackReq) => {
  return http({ method: 'POST', url: '/v1/microApp/feedback', params, showLoading: false });
};
export const putResetApi = (params: IPutResetReq) => {
  return http({ method: 'POST', url: '/v1/microApp/reset', params, usePostUrlParams: true });
};

export const getEduPhotoModelApi = () => {
  return http<IEduPhotoModelRes[]>({ method: 'GET', url: '/v1/resource/edu/photo/model' });
};

export const createShareIdApi = (params) => {
  return http<string>({ method: 'POST', url: '/v1/edu/photos/createShareId', params });
};
export const shareIdApi = (params: { id: string }) => {
  return http<string[]>({ method: 'GET', url: `/v1/photos/shareId/${params.id}` });
};
export const interruptSessionApi = (params: { microAppUuid: EMicroAppUuid }) => {
  return http({ method: 'POST', url: `/v1/microApp/interruptSession`, params, showLoading: false });
};
export const setTagApi = (params: ISetTagReq) => {
  return http({ method: 'POST', url: `/v1/microApp/tag`, params, showLoading: false });
};
