import ImageContent, { EType } from '@plugin/components/ImageContent';
import { shareIdApi } from '@plugin/request';
import { Button, View } from '@tarojs/components';
import { useRouter, useShareAppMessage } from '@tarojs/taro';
import { useRequest } from 'ahooks';
import React, { useEffect } from 'react';
import './share_img.less';

const ShareImg = () => {
  const router = useRouter<RouterParams<{ shareId: string }>>();
  const { data: imgList, run } = useRequest(shareIdApi, { manual: true });

  useEffect(() => {
    const { shareId } = router.params;
    if (shareId) {
      run({ id: shareId });
    }
  }, [router]);

  useShareAppMessage(() => {
    return {
      title: `我分享了${imgList?.length}张照片`,
    };
  });

  return (
    <View className="wrapper">
      <View className="content">
        <View className="title">我分享了{imgList?.length}张照片</View>
        <View className="sub-title">快来看看宝贝的精彩瞬间，真是太可爱了</View>
        {!!imgList && (
          <ImageContent
            imageArray={imgList}
            renderType={EType.RESULT_POP}
            maxShow={999}
            wrapperClass="share-img-wrapper"
          />
        )}
      </View>
      {!!imgList && (
        <View className="footer">
          <Button openType="share" type="primary" className="share-btn" hoverClass="none">
            分享
          </Button>
        </View>
      )}
    </View>
  );
};

export default ShareImg;
