import Taro from '@tarojs/taro';
import React, { useContext, useMemo } from 'react';
import { Button, Text, View } from '@tarojs/components';
import { EBubbleKey, type IBubbleComponent } from '@plugin/request/chat/type';
import { EStorage } from '@plugin/types';
import type { IPictureFrameList } from '@plugin/hooks/useDrawPhoto';
import { createShareIdApi } from '@plugin/request';
import { ChatWrapperContext } from '@plugin/stores/ChatWrapperContext';
import { PRE_PLUGIN_PATH } from '@plugin/constants';
import ImageContent, { EType } from '../ImageContent';
import './index.less';
import { EAnswerStatus } from '../ChatWrapper';

export interface IImageAnswerProps {
  bubbleList?: IBubbleComponent[];
  imageList?: string[];
  pictureFrameList?: IPictureFrameList[];
  chatContent: string;
}

/**
 * @description: 图片式回答的气泡组件
 * @param {*}
 * @return {*}
 */
const ImageAnswer = ({ bubbleList, imageList, chatContent, pictureFrameList }: IImageAnswerProps) => {
  const { answerStatus } = useContext(ChatWrapperContext) || {};
  const bubbleClickHandle = async (item: IBubbleComponent) => {
    if (answerStatus !== EAnswerStatus.UN_ANSWER) {
      Taro.showToast({
        title: '正在回复中',
        icon: 'none',
      });
      return;
    }
    switch (item.key) {
      case EBubbleKey.POSTER:
        Taro.setStorageSync(EStorage.EDU_CHOOSE_IMG_LIST, imageList);
        Taro.navigateTo({
          url: `${PRE_PLUGIN_PATH}/img_list/index?renderType=${EType.SELECT}`,
        });
        break;
      case EBubbleKey.SHARE: {
        const shareId = await createShareIdApi(imageList);
        Taro.navigateTo({
          url: `${PRE_PLUGIN_PATH}/share_img/index?shareId=${shareId}`,
        });
        break;
      }
      default:
        break;
    }
  };
  const unSupportScenes = useMemo(() => {
    return bubbleList?.some((item) => [EBubbleKey.DISTRIBUTE].includes(item.key));
  }, [bubbleList]);

  return (
    <View className="image-answer">
      <Text decode>{chatContent}</Text>
      {/* <View className="frame">
        {pictureFrameList?.map((item, index) => {
          return <View className="frame-content" key={index}>
            <Image src={item.url} className='frame-img' mode='aspectFill' />
            <View className="frame-load" />
          </View>
        })}
      </View> */}
      {pictureFrameList && (
        <ImageContent imageArray={pictureFrameList.map((item) => item.url)} renderType={EType.RESULT_POP} maxShow={9} />
      )}
      {imageList && <ImageContent imageArray={imageList} renderType={EType.RESULT_POP} maxShow={9} />}
      {!!imageList?.length && bubbleList && !unSupportScenes && (
        <View className="operator">
          {bubbleList
            .filter((item) => [EBubbleKey.POSTER, EBubbleKey.SHARE].includes(item.key))
            .map((item) => {
              return (
                <Button
                  key={item.id}
                  type="primary"
                  className="operator-btn"
                  // @ts-ignore
                  // openType={`${item.key === EBubbleKey.SHARE ? 'share' : undefined}`}
                  onClick={() => bubbleClickHandle(item)}
                >
                  {item.bubbleInfo}
                </Button>
              );
            })}
        </View>
      )}
    </View>
  );
};

export default ImageAnswer;
