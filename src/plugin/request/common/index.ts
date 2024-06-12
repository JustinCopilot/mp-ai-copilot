import http from '@plugin/utils/https';
import type { IGetCosAuthReq, IGetCosAuthRes, ITurnTokenReq, ITurnTokenRes } from './type';

export const turnTokenApi = (params: ITurnTokenReq) => {
  return http<ITurnTokenRes>({
    method: 'POST',
    url: '/v1/token/turn',
    params,
    options: { header: { Authorization: '' } },
  });
};

export const getCosAuthApi = (params: IGetCosAuthReq) => {
  return http<IGetCosAuthRes>({
    method: 'GET',
    url: '/v1/resource/edu/cos',
    params,
    // options: { header: { Authorization: '' } },
  });
};
