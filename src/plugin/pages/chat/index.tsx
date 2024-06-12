import React, { useEffect, useState } from 'react';
import ChatWrapper from '@plugin/components/ChatWrapper';
import GlobalProvider from '@plugin/components/GlobalProvider';
import Taro, { useRouter, useShareAppMessage } from '@tarojs/taro';
import { EMicroAppIdITest, EMicroAppIdProd } from '@plugin/request/chat/type';
import { View } from '@tarojs/components';
import { AtNavBar } from 'taro-ui';
import { PRE_PLUGIN_PATH, TOP_BAR_HEIGHT } from '@plugin/constants';
import useGetScenes from '@plugin/hooks/useGetScenes';
import { transformRouterParams } from '@plugin/utils/router';
import type { IChatExtensionRouter } from '@plugin/pages/chat_extension';

import 'taro-ui/dist/style/components/nav-bar.scss';
import 'taro-ui/dist/style/components/icon.scss';
import './index.less';

export interface IChatRouter {
  microAppId: number;
  params: any;
}
const titleMap = {
  [EMicroAppIdITest.EDU_KNOWLEDGE]: {
    name: '幼教知识百事通',
    logo: 'https://senior.cos.clife.cn/xiao-c/EDU_KNOWLEDGE@2x.png',
  },
  [EMicroAppIdProd.EDU_KNOWLEDGE]: {
    name: '幼教知识百事通',
    logo: 'https://senior.cos.clife.cn/xiao-c/EDU_KNOWLEDGE@2x.png',
  },
  [EMicroAppIdITest.EDU_PHOTO]: { name: '智能相册助手', logo: 'https://senior.cos.clife.cn/xiao-c/EDU_PHOTO@2x.png' },
  [EMicroAppIdProd.EDU_PHOTO]: { name: '智能相册助手', logo: 'https://senior.cos.clife.cn/xiao-c/EDU_PHOTO@2x.png' },
  [EMicroAppIdITest.EDU_BEHAVIOR]: {
    name: '幼儿行为观察助手',
    logo: 'https://senior.cos.clife.cn/xiao-c/EDU_BEHAVIOR@2x.png',
  },
  [EMicroAppIdProd.EDU_BEHAVIOR]: {
    name: '幼儿行为观察助手',
    logo: 'https://senior.cos.clife.cn/xiao-c/EDU_BEHAVIOR@2x.png',
  },
  [EMicroAppIdITest.BEAUTY_SUMMARY]: { name: '回访总结生成', logo: '' },
  [EMicroAppIdProd.BEAUTY_SUMMARY]: { name: '回访总结生成', logo: '' },
};

const Chat = (props) => {
  const router = useRouter<RouterParams<IChatRouter>>();
  const [microAppId, setMicroAppId] = useState<EMicroAppIdITest | EMicroAppIdProd>();
  const [params, setParams] = useState<any>();
  const { isBeautySummaryScenes } = useGetScenes(microAppId);

  useShareAppMessage((res) => {
    console.log('res.target=', res);
    return {
      title: `我分享了几张照片给你，快来看看吧~`,
      imageUrl: 'https://senior.cos.clife.cn/xiao-c/icon_chat_play.png',
      path: '',
    };
  });

  useEffect(() => {
    if (router.params.microAppId) {
      setMicroAppId(Number(router.params.microAppId));
    }
    console.log('router.params.params', decodeURIComponent(router.params.params || ''));
    if (router.params.params) {
      setParams(router.params.params);
    }
  }, [router]);

  const extensionHandle = () => {
    const params: IChatExtensionRouter = {
      microAppId: microAppId!,
      microAppName: titleMap[microAppId!].name,
      logo: titleMap[microAppId!].logo,
    };
    const routerParams = transformRouterParams<IChatExtensionRouter>(params);
    Taro.navigateTo({ url: `${PRE_PLUGIN_PATH}/chat_extension/index?${routerParams}` });
  };

  return (
    <GlobalProvider scope={props.$scope}>
      <View className="chat-page" style={{ paddingTop: TOP_BAR_HEIGHT }}>
        <AtNavBar
          border={false}
          leftIconType="chevron-left"
          color="#1E222F"
          onClickLeftIcon={() => Taro.navigateBack()}
        >
          <View className="navbar-header" onClick={extensionHandle}>
            <View>{(microAppId && titleMap[microAppId].name) || '智能对话'}</View>
            {!isBeautySummaryScenes && <View className="more" />}
          </View>
        </AtNavBar>
        {!!microAppId && <ChatWrapper microAppId={microAppId} params={params} />}
      </View>
    </GlobalProvider>
  );
};

export default Chat;
