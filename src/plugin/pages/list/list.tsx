import React, { useEffect, useMemo } from 'react';
import { View, Navigator } from '@tarojs/components';
import type { IRouterParams } from '@plugin/hooks/useTurnToken';
import useTurnToken from '@plugin/hooks/useTurnToken';
import { getMicroListApi } from '@plugin/request';
import { useRequest } from 'ahooks';
import { transformRouterParams } from '@plugin/utils/router';
import { useDidShow, useRouter } from '@tarojs/taro';
import { PRE_PLUGIN_PATH } from '@plugin/constants';
import { EMicroAppUuid } from '@plugin/request/chat/type';
import type { IChatRouter } from '../chat/chat';
import './list.less';

let firstFlag = true;
const List = () => {
  const router = useRouter<Partial<IRouterParams>>();
  const { aiToken } = useTurnToken();
  const { data, run } = useRequest(getMicroListApi, { manual: true });

  const microList = useMemo(() => {
    console.log('%c [ data ]', 'font-size:13px; background:pink; color:#bf2c9f;', data);
    return data?.filter((item) =>
      [
        EMicroAppUuid.EDU_KNOWLEDGE,
        EMicroAppUuid.EDU_PHOTO,
        EMicroAppUuid.BEAUTY_SUMMARY,
        EMicroAppUuid.EDU_BEHAVIOR,
      ].includes(item.microAppUuid as EMicroAppUuid),
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
          microAppUuid: item.microAppUuid,
        };
        const routerParams = transformRouterParams<IChatRouter>(params);
        return (
          <Navigator url={`${PRE_PLUGIN_PATH}/chat/chat?${routerParams}`} className="item" key={item.microAppUuid}>
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
