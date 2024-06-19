import React, { useState } from 'react';
import { View, Button, Input } from '@tarojs/components';
import { ETurnTokenType } from '@plugin/request/common/type';
import { EEnv } from '@plugin/types';
import Taro from '@tarojs/taro';
import ClifeAiHelperEnter from '@plugin/components/Enter/Enter';
import { PRE_PLUGIN_PATH } from '@common/constants';
import './index.less';

const Index = () => {
  const [enterStatus, setEnterStatus] = useState(0);
  const [mobile, setMobile] = useState<string>();
  const [returnData, setReturnData] = useState(null);

  const handleInit = () => {
    if (!mobile) Taro.showToast({ title: '请先输入任意手机号', icon: 'none' });
    setMobile(mobile);
    // 随机生成8位数,避免调试时，短信超频
    // setMobile('104' + Math.random().toString().slice(2, 10));
  };

  const handleBlur = (event) => {
    setMobile(event.detail?.value);
  };
  const handleChangeStatus = (status: number) => {
    setEnterStatus(status);
  };

  const handleNavigate = (p: any) => {
    Taro.navigateTo({
      ...p,
      url: `${PRE_PLUGIN_PATH}/list/list?mockFlag=Y`
    });
  };

  const handleLisenReturn = (data: any) => {
    setReturnData(data);
  };

  return (
    <View className="index">
      <ClifeAiHelperEnter
        {...{
          env: EEnv.ITEST,
          mode: 'mobileVerifyCode',
          appType: ETurnTokenType.EDUCATION,
          mobile,
          onChangeStatu: handleChangeStatus,
          onNavigate: handleNavigate,
          onLisenReturn: handleLisenReturn,
        }}
      >
        {enterStatus === 1 ? <Button>{enterStatus !== 1 ? '初始化中' : '点击进入技能列表'}</Button> : null}
      </ClifeAiHelperEnter>
      {enterStatus === 0 && (
        <view>
          <Input name="mobile" type="number" placeholder="请输入手机号码" onBlur={handleBlur} />
          <Button onClick={handleInit}>点击初始化插件</Button>
        </view>
      )}
    </View>
  );
};

export default Index;
