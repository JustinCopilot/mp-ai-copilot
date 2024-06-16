import React, { useEffect } from 'react';
import Taro, { useRouter } from '@tarojs/taro';
import { useRequest } from 'ahooks';
import { turnTokenApi } from '@plugin/request';
import type { ITurnTokenReq } from '@plugin/request/common/type';
import { setToken } from '@plugin/utils/token';
import type { EEnv } from '@plugin/types';
import { EStorage } from '@plugin/types';

export interface IRouterParams extends Omit<ITurnTokenReq, 'type'> {
  type: string;
  env: EEnv;
  mockFlag?: string;
}

const useTurnToken = () => {
  const router = useRouter<Partial<IRouterParams>>();
  console.log('%c [ useTurnToken router ]-18', 'font-size:13px; background:pink; color:#bf2c9f;', router);
  const { data: aiToken, run: turnTokenFn } = useRequest(turnTokenApi, { manual: true });
  useEffect(() => {
    const { token, type, mobile, env, mockFlag } = router.params;
    if (!(token && type && mobile && env)) {
      Taro.showToast({ title: '缺少必传字段', icon: 'error', duration: 2000 });
    } else {
      Taro.setStorageSync(EStorage.HOST_ENV, env);
      // turnTokenFn({ type: Number(type), mobile, token });

      if (process.env.NODE_ENV === 'production' && !mockFlag) {
        turnTokenFn({ type: Number(type), mobile, token });
      } else {
        // 本地token，调试用
        setToken(token);
      }
    }
  }, [router]);
  useEffect(() => {
    if (aiToken) {
      setToken(aiToken.accessToken);
    }
  }, [aiToken]);

  return {
    aiToken,
  };
};

export default useTurnToken;
