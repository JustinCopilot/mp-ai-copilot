import type { EEduBehaviorTag } from '../interface';

export interface IGetListRes {
  typeName: string;
  typeId: number;
  situationList: Array<{
    situationName: string;
    situationId: number;
  }>
}
export interface IGetListReq {
  list: string[];
}

export interface IGetRandomNotesListReq {
  dateTime?: string;
  studentId?: string;
  source?: number;
}
export interface IGetMonthDataListReq {
  month?: string;
  source?: number;
}

export interface IGetStuDataDetailReq {
  observeDate?: string;
  studentIds?: string;
  observeId?: string;
  source?: number;
  correlateId?: string;
}

export interface IGetRandomNotesListRes {
  observeDate: string;
  observeList: IObserveListRes[];
}

export interface IObserveListRes {
  observeId: number;
  content: string;
  imgUrl: string;
  aiImgUrl: string;
  videoCoverUrl: string;
  videoUrl: string;
  observeDate: string;
  observeTime: string;
  orgName?: string;
  situationList: ISituationListRes[];
  studentList: IStudentListRes[];
  source?: number;
}

export interface ISituationListRes {
  situationId: number;
  situationName: string;
}

export interface IStudentListRes {
  studentId: number;
  studentName: string;
  className: string;
  sex: number;
  age: string;
  avatar: string;
}
interface IStudentList {
  dataId: number;
  observeId: number;
  studentId: number;
  behaviorId: null;
  evaluate: string;
  createTime: null;
  studentName: string;
  className: string;
  orgId: number;
  avatar: string;
  sex: number;
  age: string;
  birthday: string;
  behaviorList: Array<any>;
}

interface ISectorType {
  typeId: number;
  typeName: string;
  status: number;
  sectorList: Array<ISector>;
}

interface ISector {
  sectorId: number;
  sectorName: string;
}

export interface IObserveDetailRes {
  observeId: number;
  userId: number;
  content: string;
  imgUrl?: string;
  aiImgUrl?: string;
  videoUrl?: string;
  videoCoverUrl?: string;
  observeDate: string;
  updateTime: string;
  situationId: null;
  sectorId: null;
  analysis: null;
  cure: null;
  flag: number;
  correlateId: null;
  source: number;
  situationList?: Array<ISituationListRes>;
  sectorTypeList?: Array<ISectorType>;
  studentList: Array<IStudentList>;
}

export interface IGetBehaviorStuDataDetailRes {
  studentId: number;
  studentName: string;
  sectorList: ISectorListRes[];
}

export interface ISectorListRes {
  area: string;
  sub: string;
  chosen: any[];
}

export interface IGetSectorListReq { }

export interface IObservationGradeInfo {
  gradeName: string;
  gradeId: number;
}

export interface IObservationSituationInfo {
  situationName: string;
  situationId: string | number;
}

// 智能体返回数据
export interface IAgentResponseData {
  content: string;
  contentType: string;
  detailData: Record<string, any>[];
  extractInfo: {
    date: string; // 观察日期
    input: string; // 观察内容
    photo: {
      aiImgUrl?: string;
      imgUrl?: string;
      videoUrl?: string;
      videoCoverUrl?: string;
    }; // 图片
    sectorList?: Record<string, any>[]; // 关联领域
    situationList?: string[]; // 观察情景
  };
  observeId: number;
  resultType: string;
  student: {
    avatar: string;
    birthday: string;
    classId: number;
    sex: number;
    studentId: number;
    studentName: string;
  }[];
  tag: EEduBehaviorTag;
}
export interface Sector {
  typeId: number;
  typeName: string;
  sectorList: Array<{
    sectorId: number;
    sectorName: string;
  }>
}

// 观察情景
export interface SectorContent {
  createTime?: string;
  status?: number;
  typeId: number;
  typeName: string;
  situationList: Array<{
    createTime?: string;
    orgId?: number
    situationId: number
    situationName: string
    status?: number
    typeId?: number
    userId?: number
  }>
}
