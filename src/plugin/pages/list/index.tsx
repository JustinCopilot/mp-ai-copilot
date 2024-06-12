import React, { useEffect, useMemo } from 'react';
import { View, Navigator } from '@tarojs/components';
import type { IRouterParams } from '@plugin/hooks/useTurnToken';
import useTurnToken from '@plugin/hooks/useTurnToken';
import { getMicroListApi } from '@plugin/request';
import { useRequest } from 'ahooks';
import { transformRouterParams } from '@plugin/utils/router';
import { useDidShow, useRouter } from '@tarojs/taro';
import { isProdEnv } from '@plugin/utils/https';
import { PRE_PLUGIN_PATH } from '@plugin/constants';
import { EMicroAppIdITest, EMicroAppIdProd } from '@plugin/request/chat/type';
import type { IChatRouter } from '../chat';
import './index.less';

let firstFlag = true;
const List = () => {
  const router = useRouter<Partial<IRouterParams>>();
  const { aiToken } = useTurnToken();
  const { data, run } = useRequest(getMicroListApi);

  const microList = useMemo(() => {
    console.log('%c [ data ]', 'font-size:13px; background:pink; color:#bf2c9f;', data);
    if (isProdEnv()) {
      return data?.filter((item) =>
        [
          EMicroAppIdProd.EDU_KNOWLEDGE,
          EMicroAppIdProd.EDU_PHOTO,
          EMicroAppIdProd.BEAUTY_SUMMARY,
          EMicroAppIdProd.EDU_BEHAVIOR,
        ].includes(item.microAppId as EMicroAppIdProd),
      );
    }
    return data?.filter((item) =>
      [
        EMicroAppIdITest.EDU_KNOWLEDGE,
        EMicroAppIdITest.EDU_PHOTO,
        EMicroAppIdITest.BEAUTY_SUMMARY,
        EMicroAppIdITest.EDU_BEHAVIOR,
      ].includes(item.microAppId as EMicroAppIdITest),
    );
  }, [data]);

  useDidShow(() => {
    // chat 页面回退时需要更新 list，首次进入这个回调不需要执行
    if (!firstFlag) {
      run();
    }
  });

  useEffect(() => {
    firstFlag = false;
  }, []);

  useEffect(() => {
    const { mockFlag } = router.params;
    // 模拟入口进入时
    if (mockFlag) {
      run();
    }
    // 实际宿主入口进入时
    if (aiToken) {
      run();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiToken, router]);

  console.log('microList', microList);
  return (
    <View className="list-page">
      {microList?.map((item) => {
        // @ts-ignore
        const params: IChatRouter = {
          microAppId: item.microAppId,
        };
        const routerParams = transformRouterParams<IChatRouter>(params);
        return (
          <Navigator url={`${PRE_PLUGIN_PATH}/chat/index?${routerParams}`} className="item" key={item.microAppId}>
            <View className="icon" style={item.icon ? { backgroundImage: `url(${item.icon})` } : {}} />
            <View className="text">
              <View className="name">{item.microAppName}</View>
              <View className="tip">{item.describe}</View>
            </View>
          </Navigator>
        );
      })}
    </View>
  );
};

export default List;
