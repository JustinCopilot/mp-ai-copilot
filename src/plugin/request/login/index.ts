import http from '@plugin/utils/https';
import type { IGetMobileVerifyCodeReq, ILoginReq, ILoginRes } from './type';

export const getMobileVerifyCodeApi = (params: IGetMobileVerifyCodeReq) => {
  return http<string>({
    method: 'GET',
    url: '/v1/user/getMobileVerifyCode',
    params,
    options: { header: { Authorization: '' } },
  });
};

export const loginApi = (params: ILoginReq) => {
  return http<ILoginRes>({
    method: 'POST',
    url: '/v1/user/login',
    params,
    options: { header: { Authorization: '' } },
  });
};
