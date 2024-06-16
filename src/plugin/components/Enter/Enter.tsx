import { turnTokenApi } from '@plugin/request';
import Taro from '@tarojs/taro';
import type { ETurnTokenType } from '@plugin/request/common/type';
import { getMobileVerifyCodeApi, loginApi } from '@plugin/request/login';
import { EEnv, EStorage } from '@plugin/types';
import { getToken, setToken } from '@plugin/utils/token';
import { useRequest } from 'ahooks';
import React, { useEffect, useState } from 'react';

interface EnterRedirectBase {
  name: string;
  params: any;
}

interface EnterProps {
  env?: EEnv; // 环境：itest或prod
  mobile: string; // 用户手机号
  appType: ETurnTokenType; // 教育 1 美业 2
  redirect?: EnterRedirectBase; // 进入什么页面，默认技能列表，进入技能详情页请传 {name:'chat',params:{microAppUuid:'xxx'}}
  requestAppUserCode?: () => Promise<{ code: string }>; // 请求宿主系统授权code的方法，需返回promise
  children?: any;
  onChangeStatu?: Function;
  mode?: 'auto' | 'mobileVerifyCode'; // 自动授权模式 和 手机验证码模式,仅在独立调试时需要使用验证码模式
  onNavigate: Function; // 需要集成方在此方法内调用navigateTo方法，navigateTo的参数将此回调的入参原样传入即可
  onLisenReturn: (data: any) => { microAppUuid: string; data: any }; // 监听返回值
}

const Enter: React.FC<EnterProps> = ({
  env = EEnv.PROD,
  appType = null,
  mobile = null,
  onChangeStatu,
  requestAppUserCode,
  redirect,
  mode = 'auto',
  onNavigate,
  onLisenReturn,
  children,
}) => {
  const token = getToken();
  const isProd = process.env.NODE_ENV === 'production';
  /**
   * @description 初始化赋值逻辑：
   * 生产环境每次都是false，每次都需要初始化；
   * 测试环境初始化后存token，后续判断有token则不需要再初始化；
   */
  const [initSuccess, setInitSuccess] = useState(!isProd && token);
  const { data: aiToken, run: turnTokenFn } = useRequest(turnTokenApi, { manual: true });

  const handeClick = () => {
    if (!initSuccess) {
      Taro.showToast({
        title: 'AI组件初始化中，请稍后',
        icon: 'none',
      });
      return;
    }
    if (redirect && redirect.name === 'chat' && redirect.params?.microAppUuid) {
      let paramsJSON = redirect.params ? '&params=' + encodeURIComponent(JSON.stringify(redirect.params)) : '';
      onNavigate &&
        onNavigate({
          url: `/plugin/pages/chat/chat?microAppUuid=${redirect.params?.microAppUuid}${paramsJSON}`,
          events: {
            Return: (data) => {
              console.log('return', data);
              onLisenReturn && onLisenReturn(data);
            },
          },
          success: (res) => {
            console.log('success', res.eventChannel);
            res.eventChannel.emit('Return', { data: 'test' });
          },
        });
    } else {
      onNavigate &&
        onNavigate({
          url: '/plugin/pages/list/list?mockFlag=Y',
          events: {
            Return: (data) => {
              console.log('return', data);
            },
          },
          success: (res) => {
            console.log('success', res.eventChannel);
            res.eventChannel.emit('Return', { data: 'test' });
          },
        });
    }
  };

  // 换token模式获取宿主系统code（宿主接入）
  useEffect(() => {
    if (!initSuccess && mode === 'auto' && requestAppUserCode && mobile && appType) {
      requestAppUserCode().then(({ code }) => {
        if (!code) return;
        turnTokenFn({
          mobile,
          token: code,
          type: appType,
        });
      });
    }
  }, [requestAppUserCode, mode, mobile, appType, initSuccess]);

  // 短信验证码模式获取宿主系统code（开发调试）
  useEffect(() => {
    if (!initSuccess && mode === 'mobileVerifyCode' && mobile && appType) {
      // 先获取验证码
      getMobileVerifyCodeApi({ mobile, type: appType }).then((code) => {
        console.log(code);
        if (!code) return;
        loginApi({ mobile, type: appType, code }).then(({ accessToken }) => {
          setToken(accessToken);
          setInitSuccess(true);
        });
      });
    }
  }, [mode, mobile, appType, initSuccess]);

  useEffect(() => {
    if (aiToken) {
      setToken(aiToken.accessToken);
      setInitSuccess(true);
    }
  }, [aiToken]);

  useEffect(() => {
    Taro.setStorageSync(EStorage.HOST_ENV, env);
  }, [env]);

  useEffect(() => {
    onChangeStatu && onChangeStatu(initSuccess ? 1 : 0);
  }, [initSuccess, onChangeStatu]);

  return (
    <view onClick={handeClick}>
      {children}
    </view>
  );
};

export default Enter;
