import ImageContent from '@plugin/components/ImageContent';
import type { IImageItem, EType } from '@plugin/components/ImageContent';
import { EStorage } from '@plugin/types';
import Taro from '@tarojs/taro';
import React, { useEffect, useState } from 'react';
import { PRE_PLUGIN_PATH } from '@plugin/constants';
import './index.less';

export interface IParams {
  renderType: EType;
}

const ImgList = () => {
  const instance = Taro.getCurrentInstance();
  const [renderType, setRenderType] = useState(0);
  const [imageArray, setImageArray] = useState([]);

  useEffect(() => {
    setRenderType(~~(instance.router?.params.renderType as string));
  }, [instance.router?.params.renderType]);
  useEffect(() => {
    const imgs = Taro.getStorageSync(EStorage.EDU_CHOOSE_IMG_LIST);
    setImageArray(imgs);
  }, []);

  const onSelectCallback = (items: IImageItem[]) => {
    // TODO url数据过长导致超出url的长度范围
    Taro.setStorageSync(
      EStorage.EDU_FRAME_IMG_LIST,
      items.map((item: IImageItem) => item.url),
    );
    Taro.navigateTo({
      url: `${PRE_PLUGIN_PATH}/synthesis/synthesis`,
    });
  };

  return <ImageContent imageArray={imageArray} callback={onSelectCallback} renderType={renderType} />;
};

export default ImgList;
