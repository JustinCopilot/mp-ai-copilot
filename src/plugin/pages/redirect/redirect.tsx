import React, { useEffect } from 'react';
import { View } from '@tarojs/components';
import useTurnToken from '@plugin/hooks/useTurnToken';
import Taro from '@tarojs/taro';
import { PRE_PLUGIN_PATH } from '@plugin/constants';

const Redirect = () => {
  const { aiToken } = useTurnToken();
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      Taro.redirectTo({
        url: `${PRE_PLUGIN_PATH}/list/index`,
      });
    }
  }, []);

  useEffect(() => {
    if (aiToken) {
      Taro.redirectTo({
        url: `${PRE_PLUGIN_PATH}/list/index`,
      });
    }
  }, [aiToken]);

  return <View>跳转中...</View>;
};

export default Redirect;
