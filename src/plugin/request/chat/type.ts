// export enum EMicroAppIdProd {
//   EDU_KNOWLEDGE = 125, // 知识问答
//   EDU_PHOTO = 147, // 智能相册
//   BEAUTY_SUMMARY = 142, // 美业回访总结
//   EDU_BEHAVIOR = 202, // 随手记
//   EDU_OBSERVATION = 273,
//   EDU_JOT_DOWN = 2711, // 随手记编辑
// }
// export enum EMicroAppIdITest {
//   EDU_KNOWLEDGE = 33,
//   EDU_PHOTO = 132,
//   BEAUTY_SUMMARY = 127,
//   EDU_BEHAVIOR = 201,
//   EDU_JOT_DOWN = 271,
//   EDU_OBSERVATION = 272,
// }

export enum EMicroAppUuid {
  EDU_KNOWLEDGE = '1483c593-f9e4-44a6-8f4d-79c8739b4394',
  EDU_PHOTO = 'f792c2cb-d14e-4eaa-aa82-4e09cb518844',
  BEAUTY_SUMMARY = '1e6662e2-8174-4bea-9991-0c4dce21f643',
  EDU_BEHAVIOR = 'd895dd7c-c736-4a15-a33f-5e8f0c2df180',
  EDU_JOT_DOWN = 'c334ffe6-1ced-47fb-ba93-63248a003ce8',
  EDU_OBSERVATION = 'd966b5d2-3cc8-4545-9be8-01416f77414c',
}
export interface IGetMicroListRes {
  microAppName: string;
  // microAppId: EMicroAppIdProd | EMicroAppIdITest;
  microAppId: number;
  microAppUuid: EMicroAppUuid;
  describe: string;
  icon: string;
  time: number;
}
export interface IGetPresetReq {
  microAppUuid: EMicroAppUuid;
}
export interface IGetPresetRes {
  describe: string;
  query: string[];
}
export interface IGetHistoryChatReq extends RequestPageType {
  microAppUuid: EMicroAppUuid;
}
export enum EChatUser {
  User = 1,
  Ai = 2,
  Image = 3,
}
export interface IComponentInParamSelectValue {
  name?: string;
  avatar?: string;
  className?: string;
  classId?: string;
  studentId?: string;
  studentName?: string;
}
export interface IChatComponentInParam {
  componentId: number;
  paramCode: string;
  paramDesc: string;
  paramName: string;
  paramType: number;
  prefix: string;
  required: number;
  selectValue: IComponentInParamSelectValue[];
}

export enum EBizType {
  VIDEO = 'video', // 相册视频
  POSTER = 'poster', // 相册海报
  SYSTEM_TXT = 'system_txt', // 开启新会话
}
export interface IChatListRes {
  agentRole: null;
  agentName: string | null;
  agentResponse: string | null;
  updateDate: null;
  timeLong: number;
  sopId: number;
  stateId: number;
  chatTime: string;
  exeId: number;
  sessionId: string;
  chatContent: string;
  userId: number;
  chatUser: EChatUser;
  saasAppId: number;
  sopVersionID: number;
  stateName: null;
  ssdId: number;
  sopName: null;
  createDate: null;
  like: null | ELikeType;
  reason: null;
  dataId: string;
  uniqueId: string;
  labels: null;
  labelList: string;
  componentUserInPutParam: null;
  ui?: unknown;
  bubbleList?: string;
  componentInParam?: string;
  fileList: string;
  imageList: string;
  bizData?: string;
  bizId?: string;
  bizType?: EBizType;
  insertHistory?: {
    chatUser: EChatUser;
    bizData?: string;
    bizId?: string;
    bizType?: EBizType;
  };
}
export type TGetHistoryChatRes = ResponsePageType<IChatListRes>;

export enum EChatMode {
  REFRESH = 2,
  EDIT = 3,
}
export interface IImageList {
  id: string;
  type: number;
  name: string;
  url: string;
  desc: string;
  otherInfo: string;
}
export enum EBubbleKey {
  DISTRIBUTE = 'distribution',
  VIDEO = 'generate_video',
  POSTER = 'generate_image',
  SHARE = 'share_photos',
  NEED = 'need', // 美业回访信息补充（需要）
  UNNEED = 'unneed', // 美业回访信息补充（直接生成回访总结）
  MOBILE = 'mobile', // 电话回访
  WECHAT = 'wechat', // 微信回访
  NOT_CONTACTED = 'not_contacted', // 没有联系上
}

export interface IBubbleComponent {
  agentName: string;
  bubbleInfo: string;
  id: string;
  key: EBubbleKey;
  stateName: string;
  type: number;
}
export interface IPutChatReq {
  param?: Common;
  inParamFlag?: boolean;
  repeat?: boolean;
  microAppUuid: EMicroAppUuid;
  mode?: EChatMode;
  query?: string;
  imageList?: string;
  fileList?: string;
  userParam?: Common;
  bubbleComponent?: IBubbleComponent;
  chatUser?: EChatUser;
  insertHistory?: {
    chatUser: EChatUser;
    bizData?: string;
    bizId?: string;
    bizType?: EBizType;
  };
}
export interface IChatData {
  callEndTime: number;
  callLogList: Array<{
    agentId: number;
    callEndTime: number;
    callName: string;
    callStartTime: number;
    callType: string;
    imageList: Array<string>;
    labelList: Array<string>;
    response: string;
    sopId: number;
    stateId: number;
    timeLong: number;
  }>;
  callStartTime: number;
  content: string;
  dataId: string;
  uniqueId: string;
  first: boolean;
  bubbleList: string;
  componentInParam: IChatComponentInParam[];
  imageList: string;
  labelList: string;
  agentResponse: string;
  sessionId: string;
  sessionNum: number;
  sopId: number;
  timeLong: number;
}
export interface IPutChatRes {
  content: string;
  data?: Partial<IChatData>;
  errCode: number;
  errMessage: string;
  finish: boolean;
}

export enum ELikeType {
  GOOD = 0,
  BAD = 1,
  UNSAFE = 2,
  FRAUDULENTLY = 3,
  UNHELP = 4,
  OTHER = 5,
}
export interface IPutFeedbackReq {
  dataId: string;
  like: ELikeType | null;
  microAppUuid: EMicroAppUuid;
  reason?: string;
}
export interface IPutResetReq {
  microAppUuid: EMicroAppUuid;
}

export interface IEduPhotoModelRes {
  name: string;
  thum: string;
  url: string;
}

export enum EChatItemTag {
  EDU_INFORMATION_SUPPLEMENTED = 'edu_information_supplemented',
  EDU_INFORMATION_SUPPLEMENT_DATA = 'edu_information_supplement_data',
}
export interface ISetTagReq {
  dataId: string;
  tag: EChatItemTag;
}
