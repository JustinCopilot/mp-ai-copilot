export interface IGetMobileVerifyCodeReq {
  mobile: string;
  type: number;
}
export interface ILoginReq {
  mobile: string;
  code: string;
  type: number;
}
export interface ILoginRes {
  accessToken: string;
  accessTokenExpires: number;
  refreshToken: string;
  refreshTokenExpires: number;
}
