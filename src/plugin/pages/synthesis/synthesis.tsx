import { Button, Image, Swiper, SwiperItem, Text, View } from '@tarojs/components';
import React, { useEffect, useState } from 'react';
// import IconWrap from '@components/AnswerOperater/components/IconWrap';
import BottomOperator from '@plugin/components/BottomOperator';
import Taro from '@tarojs/taro';
import { EStorage } from '@plugin/types';
import { useRequest } from 'ahooks';
import { getEduPhotoModelApi } from '@plugin/request/chat';
import './index.less';

export enum EChangeHandelType {
  NEXT,
  PREV,
}
export interface ISynthesisImg {
  mainImg: string;
  frameImg: string;
}

const Synthesis = () => {
  const [images, setImages] = useState([]);
  const [current, setCurrent] = useState(0); // 选中图片的current
  // const [currentAvatar, setCurrentAvatar] = useState(0); // 选中的头像的current
  const [synthesisImg, setSynthesisImg] = useState<ISynthesisImg[]>([]);
  const { data: modelPhotoData = [] } = useRequest(getEduPhotoModelApi);

  const onModelAvatarHandle = (index: number) => {
    // setCurrentAvatar(index);
    synthesisImg.splice(current, 1, {
      mainImg: images[current],
      frameImg: modelPhotoData[index].url,
    });
    setSynthesisImg([...synthesisImg]);
  };

  const onImageChangeHandle = (type: EChangeHandelType) => {
    setCurrent(type === EChangeHandelType.NEXT ? current + 1 : current - 1);
  };
  const completeClickHandle = () => {
    Taro.setStorageSync(EStorage.EDU_SYNTHESIS_IMG_LIST, synthesisImg);
    Taro.navigateBack({ delta: 2 });
  };

  useEffect(() => {
    const images = Taro.getStorageSync(EStorage.EDU_FRAME_IMG_LIST);
    setImages(images);
  }, []);
  useEffect(() => {
    if (images.length && modelPhotoData.length) {
      setSynthesisImg(
        images.map((item) => {
          return {
            mainImg: item,
            frameImg: modelPhotoData[0].url,
          };
        }),
      );
    }
  }, [images, modelPhotoData]);

  return (
    <View className="synthesis">
      <View className="synthesis-contenter">
        <View className="main-img-container">
          <View className="icon-view">
            {current > 0 ? (
              <View onClick={() => onImageChangeHandle(EChangeHandelType.PREV)} className="icon prev" />
            ) : null}
          </View>
          <View className="img-container">
            <Swiper
              className="img-swiper"
              current={current}
              onChange={(e) => {
                setCurrent(e.detail.current);
              }}
            >
              {images.map((item, index) => {
                return (
                  <SwiperItem key={index}>
                    <Image mode="aspectFill" src={item} className="show-img" />
                    <Image src={synthesisImg[index]?.frameImg} className="cover-img" />
                  </SwiperItem>
                );
              })}
            </Swiper>
          </View>
          <View className="icon-view">
            {current < images.length - 1 ? (
              <View onClick={() => onImageChangeHandle(EChangeHandelType.NEXT)} className="icon next" />
            ) : null}
          </View>
        </View>
        <View className="show-count">
          {current + 1}/{images.length}
        </View>
        <View className="cover-img-scroll">
          {modelPhotoData.map((item, index) => (
            <View
              key={index}
              onClick={() => onModelAvatarHandle(index)}
              className={`model-item ${item.url === synthesisImg[current]?.frameImg ? 'selected' : ''}`}
            >
              <View className="model-img">
                <Image mode="aspectFill" src={item.thum} className="img" />
              </View>
              <Text>{item.name}</Text>
            </View>
          ))}
        </View>
      </View>
      <BottomOperator>
        <Button type="primary" onClick={completeClickHandle} hoverClass="none">
          完成
        </Button>
      </BottomOperator>
    </View>
  );
};

export default Synthesis;
