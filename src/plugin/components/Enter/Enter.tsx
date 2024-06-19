import React, { useEffect, useState } from 'react';
import Taro from '@tarojs/taro';
import { useRequest } from 'ahooks';
import { turnTokenApi } from '@plugin/request';
import { getMobileVerifyCodeApi, loginApi } from '@plugin/request/login';
import type { ETurnTokenType } from '@plugin/request/common/type';
import { EEnv, EStorage } from '@plugin/types';
import { getToken, setToken } from '@common/utils/token';
import { PRE_PLUGIN_PATH } from '@common/constants';

interface IEnterRedirectBase {
  name: string;
  params: any;
}

interface EnterProps {
  env: EEnv; // 环境：itest或prod
  mobile?: string; // 用户手机号
  appType?: ETurnTokenType; // 教育 1 美业 2
  redirect?: IEnterRedirectBase; // 进入什么页面，默认技能列表，进入技能详情页请传 {name:'chat',params:{microAppUuid:'xxx'}}
  requestAppUserCode?: () => Promise<{ code: string }>; // 请求宿主系统授权code的方法，需返回promise
  children?: any;
  onChangeStatu?: Function;
  mode?: 'auto' | 'mobileVerifyCode'; // 自动授权模式 和 手机验证码模式,仅在独立调试时需要使用验证码模式
  onNavigate?: Function; // 需要集成方在此方法内调用navigateTo方法，navigateTo的参数将此回调的入参原样传入即可
  onLisenReturn?: (data: any) => { microAppUuid: string; data: any }; // 监听返回值
}

const Enter: React.FC<EnterProps> = (props) => {
  const {
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
  } = props;
  const token = getToken();
  const isBuild = process.env.NODE_ENV === 'production';
  /**
   * @description 初始化赋值逻辑：
   * 打包后，每次都是false，每次都需要初始化；
   * 开发模式下，初始化后存token，后续判断有token则不需要再初始化；
   */
  const [initSuccess, setInitSuccess] = useState(!isBuild && token);
  const { data: aiToken, run: turnTokenFn } = useRequest(turnTokenApi, { manual: true });

  const handeClick = () => {
    if (!initSuccess) {
      return Taro.showToast({
        title: 'AI组件初始化中，请稍后',
        icon: 'none',
      });
    }
    if (redirect?.name === 'chat' && redirect?.params?.microAppUuid) {
      const paramsJSON = `&params=${encodeURIComponent(JSON.stringify(redirect.params))}`;
      onNavigate?.({
        url: `${PRE_PLUGIN_PATH}/chat/chat?microAppUuid=${redirect.params?.microAppUuid}${paramsJSON}`,
        events: {
          Return: (data) => {
            console.log('returnData', data);
            onLisenReturn?.(data);
          },
        },
        success: (res) => {
          console.log('success', res.eventChannel);
          res.eventChannel.emit('Return', { data: 'test' });
        },
      });
    } else {
      onNavigate?.({
        url: `${PRE_PLUGIN_PATH}/list/list`,
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
