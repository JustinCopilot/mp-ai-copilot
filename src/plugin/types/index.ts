import type { BaseEventOrig } from '@tarojs/components';
import type { EMicroAppIdITest, EMicroAppIdProd } from '@plugin/request/chat/type';

export enum EStorage {
  MOBILE = 'mobile',
  TOKEN = 'token',
  HOST_ENV = 'host_env',
  EDU_CHOOSE_IMG_LIST = 'edu_choose_img_list',
  EDU_FRAME_IMG_LIST = 'edu_frame_img_list',
  EDU_SYNTHESIS_IMG_LIST = 'edu_synthesis_img_list',
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
    microAppId: EMicroAppIdITest.BEAUTY_SUMMARY | EMicroAppIdProd.BEAUTY_SUMMARY;
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
  microAppId: EMicroAppIdITest.BEAUTY_SUMMARY | EMicroAppIdProd.BEAUTY_SUMMARY;
  data: {
    type: 'mobile' | 'wechat'; // 回访方式
    summaryContent?: string; // 回访总结
    satisfaction?: '高' | '中' | '低'; // 用户满意度
    tags?: Array<string>; // 用户标签
    images?: Array<string>; // 回访图片
  };
}
