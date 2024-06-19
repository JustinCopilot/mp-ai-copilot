import type { BaseEventOrig } from '@tarojs/components';
import type { EMicroAppUuid } from '@plugin/request/chat/type';

export enum EStorage {
  TOKEN = 'xiaoc_token',
  HOST_ENV = 'xiaoc_env',
  EDU_CHOOSE_IMG_LIST = 'edu_choose_img_list',
  EDU_FRAME_IMG_LIST = 'edu_frame_img_list',
  EDU_SYNTHESIS_IMG_LIST = 'edu_synthesis_img_list',
  EDU_SELECTED_CHILD_DATA = 'edu_selected_child_data', // 我的归档筛选幼儿
}

export enum EEnv {
  ITEST = 'itest',
  PROD = 'prod',
}

export enum EPageFrom {
  CHAT_EXTENSION = 'chat_extension',
  EDIT_OBSERVATION = 'edit_observation',
}

export type TFormEvents<T> = BaseEventOrig<{ value: T }>;

// 美业回访总结携带参数
export interface IBeautySummaryEnterParams {
  name: 'chat';
  params: {
    microAppUuid: EMicroAppUuid.BEAUTY_SUMMARY,
    data: {
      user: {
        name: string;
        gender: 1 | 2; // 1 男  2女
        age: number;
        project?: string;
        avatar?: string;
        time: string;
      };
    };
  };
}

export interface IBeautySummaryReturnParams {
  microAppUuid: EMicroAppUuid.BEAUTY_SUMMARY,
  data: {
    type: 'mobile' | 'wechat'; // 回访方式
    summaryContent?: string; // 回访总结
    satisfaction?: '高' | '中' | '低'; // 用户满意度
    tags?: Array<string>; // 用户标签
    images?: Array<string>; // 回访图片
  };
}
