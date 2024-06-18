import React, { useEffect, useState } from 'react';
import Taro, { useRouter } from '@tarojs/taro';
import { Button, View } from '@tarojs/components';
import useGetScenes from '@plugin/hooks/useGetScenes';
import { putResetApi } from '@plugin/request';
import { PRE_EDU_PATH } from '@common/constants';
import { AtModal, AtModalAction } from 'taro-ui';
import { EPageFrom } from '@plugin/types';
import { EMicroAppUuid } from '@plugin/request/chat/type';
import { getPageInstance } from '@common/utils';
import 'taro-ui/dist/style/components/modal.scss';
import './index.less';

export interface IChatExtensionRouter {
  microAppUuid: EMicroAppUuid;
  microAppName: string;
  logo: string;
}
interface IConfig {
  icon: string;
  text: string;
  needRight?: boolean;
  cb: () => void;
}

const ChatExtension = () => {
  const router = useRouter<RouterParams<IChatExtensionRouter>>();
  const [routerParams, setRouterParams] = useState<RouterParams<IChatExtensionRouter>>();
  const [isOpened, setIsOpened] = useState(false);
  const [config, setConfig] = useState<IConfig[]>([
    {
      icon: 'https://senior.cos.clife.cn/xiao-c/delete@2x.png',
      text: '清除会话历史',
      cb: () => {
        setIsOpened(true);
      },
    },
  ]);

  const { isEduBehaviorScenes } = useGetScenes(routerParams?.microAppUuid as EMicroAppUuid);
  const closeModal = () => setIsOpened(false);
  const clearHandle = () => {
    putResetApi({ microAppUuid: routerParams?.microAppUuid as EMicroAppUuid })
      .then(() => {
        Taro.showToast({
          title: '已清除会话历史',
          icon: 'none',
        });
        const prePage = getPageInstance(-1);
        prePage.setData({ from: EPageFrom.CHAT_EXTENSION });
      })
      .finally(() => {
        closeModal();
      });
  };

  useEffect(() => {
    if (router.params) {
      setRouterParams(router.params);
      if (isEduBehaviorScenes) {
        setConfig([
          {
            icon: 'https://senior.cos.clife.cn/xiao-c/printer@2x.png',
            text: '幼儿行为观察归档记录',
            cb: () => {
              Taro.navigateTo({ url: `${PRE_EDU_PATH}/my_archive/index` });
            },
            needRight: true,
          },
          ...config,
        ]);
      }
    }
  }, [router, isEduBehaviorScenes]);

  return (
    <View className="chat-extension-page">
      <View className="chat-extension">
        <View className="micro-info">
          <View className="logo" style={{ backgroundImage: `url(${routerParams?.logo})` }} />
          <View className="micro-name">{routerParams?.microAppName}</View>
        </View>
        {config.map((item) => {
          return (
            <View className="config-item" key={item.text} onClick={item.cb}>
              <View className="left">
                <View className="icon" style={{ backgroundImage: `url(${item.icon})` }} />
                <View className="text">{item.text}</View>
              </View>
              {item.needRight && <View className="right" />}
            </View>
          );
        })}
        <AtModal isOpened={isOpened} onClose={closeModal}>
          <View className="modal-content">
            <View className="header">确定要清除会话历史吗？</View>
            <View className="content">清除会话历史后，会话信息将会被清空</View>
          </View>
          <AtModalAction>
            <Button onClick={closeModal}>取消</Button>
            <Button onClick={clearHandle}>确定</Button>
          </AtModalAction>
        </AtModal>
      </View>
    </View>
  );
};

export default ChatExtension;
