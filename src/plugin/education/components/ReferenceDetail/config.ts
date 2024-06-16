import { IUserParams } from "@plugin/education/pages/jot_down_detail";

export enum DataType {
  notable = 1,
  observe,
}
export interface State {
  current: number;
}

export interface StudentInfo {
  studentId?: number;
  studentName?: string;
  avatar?: string;
  sex?: number;
  age?: number;
  className?: string;
  height?: number;
  heightAssess?: string;
  weight?: number;
  weightAssess?: string;
  level?: number;
  measureTime?: string;
  dataList?: Array<{
    timeLength?: number;
    week?: number;
    locationName?: string;
    dataTime?: string;
    sleepDuration?: number;
    waterAmount?: number;
  }>;
  top5List?: Array<{
    observeId?: number | null;
    content?: string | null;
    imgUrl?: string | null;
    observeDate?: string | null;
    observeTime?: string | null;
  }>;
}
export enum EModules {
  BODY = 'body',
  INTEREST = 'interest',
  WATER = 'water',
  SLEEP = 'sleep',
}
export interface Props {
  data: Array<StudentInfo>;
  type?: DataType;
  observationdetail?: IUserParams
  modules?: EModules[]
}
