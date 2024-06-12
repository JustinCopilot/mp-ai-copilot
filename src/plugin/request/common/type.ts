export enum ETurnTokenType {
  EDUCATION = 1,
  BEAUTY = 2,
}

export interface ITurnTokenReq {
  mobile: string;
  token: string;
  type: ETurnTokenType;
}

export interface ITurnTokenRes {
  accessToken: string;
  accessTokenExpires: string;
  refreshToken: string;
  refreshTokenExpires: string;
}
export interface IGetCosAuthReq {
  ext: string;
}

export interface IGetCosAuthRes {
  authorization: string;
  securityToken: string;
  cosHost: string;
  cosKey: string;
}
