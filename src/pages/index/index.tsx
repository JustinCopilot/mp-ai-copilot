import React, { useState } from 'react';
import { View, Button, Input } from '@tarojs/components';
import { ETurnTokenType } from '@plugin/request/common/type';
import Taro from '@tarojs/taro';
import { PAGInit } from 'libpag-miniprogram';
import ClifeAiHelperEnter from '@plugin/components/Enter/Enter';
import './index.less';

const Index = () => {
  const [enterStatu, setEnterStatu] = useState(0);
  const [mobile, setMobile] = useState<string | null>(null);
  const [initMobile, setInitMobile] = useState<string | null>(null);
  const [returnData, setReturnData] = useState(null);

  const handleInit = () => {
    if (!mobile) Taro.showToast({ title: '请先输入任意手机号', icon: 'none' });
    // 随机生成8位数,避免调试时，短信超频
    setInitMobile(mobile);
    // setInitMobile('104' + Math.random().toString().slice(2, 10));
  };

  const handleMobileInput = (event) => {
    setMobile(event.detail?.value);
  };
  const handleChangeStatu = (p) => {
    console.log(p, 'p');
    setEnterStatu(p);
  };

  const handleNavigate = (p: any) => {
    Taro.navigateTo(p);
  };

  const handleLisenReturn = (data: any) => {
    setReturnData(data);
  };

  return (
    <View className="index">
      <ClifeAiHelperEnter
        {...{
          env: 'itest',
          mode: 'mobileVerifyCode',
          appType: ETurnTokenType.EDUCATION,
          mobile: initMobile,
          onChangeStatu: handleChangeStatu,
          onNavigate: handleNavigate,
          onLisenReturn: handleLisenReturn,
        }}
      >
        {/* @ts-ignore */}
        {enterStatu === 1 ? <Button>{enterStatu !== 1 ? '初始化中' : '点击进入技能列表'}</Button> : null}
      </ClifeAiHelperEnter>
      {enterStatu === 0 && (
        <view>
          <Input name="mobile" type="number" placeholder="请输入手机号码" onInput={handleMobileInput} />
          <Button onClick={handleInit}>点击初始化插件</Button>
        </view>
      )}

    </View>
  );
};

export default Index;
