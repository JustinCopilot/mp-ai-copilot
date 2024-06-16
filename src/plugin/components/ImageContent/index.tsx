import type { ITouchEvent } from '@tarojs/components';
import { Button, Image, Swiper, SwiperItem, Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import React, { useEffect, useMemo, useState } from 'react';
import { EStorage } from '@plugin/types';
import { PRE_PLUGIN_PATH } from '@plugin/constants';
import BottomOperator from '../BottomOperator';
import './index.less';

/**
 * @description: 代表场景 结果气泡、查看全部图片、选择图片
 */
export enum EType {
  RESULT_POP,
  VIEW_ALL,
  SELECT,
}

export interface IImageItem {
  url: string;
  id: number;
  isCheck?: boolean;
}

interface IProps {
  imageArray: string[];
  renderType: EType;
  maxShow?: number;
  wrapperClass?: string;
  callback?: (items: IImageItem[]) => void;
}
const MAX_SELECT_NUMBER = 9;

const ImageContent = ({ imageArray, renderType, maxShow = 9, wrapperClass = '', callback }: IProps) => {
  const [imageList, setImageList] = useState<IImageItem[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [currentImg, setCurrentImg] = useState(0);

  const isSelectType = renderType === EType.SELECT;
  const restRenderNumber = imageArray.length - maxShow;
  const resultPopClass = renderType === EType.RESULT_POP ? 'result-pop' : '';

  const selectItems = useMemo((): IImageItem[] => {
    return imageList.filter((item) => item.isCheck);
  }, [imageList]);
  const selectLength = selectItems.length;

  const onItemSelectHandle = (item: IImageItem, index: number): void => {
    switch (renderType) {
      case EType.RESULT_POP:
        if (restRenderNumber > 0 && index === imageList.length - 1) {
          Taro.setStorageSync(EStorage.EDU_CHOOSE_IMG_LIST, imageArray);
          Taro.navigateTo({
            url: `${PRE_PLUGIN_PATH}/img_list/img_list?renderType=${EType.VIEW_ALL}`,
          });
          return;
        }
        Taro.previewImage({
          current: item.url,
          urls: imageList.map((item) => item.url),
        });
        break;
      case EType.VIEW_ALL:
        Taro.previewImage({
          current: item.url,
          urls: imageList.map((item) => item.url),
        });
        break;
      case EType.SELECT:
        setCurrentImg(index);
        setShowPreview(true);
        break;
    }
  };

  const onNextHandle = () => {
    console.log('选中的图片', selectItems);
    hidePreviewHandle();
    callback && callback(selectItems);
  };
  const checkHandle = (e: ITouchEvent, index: number) => {
    e.stopPropagation();
    const img = imageList[index];
    // 如果选中的数量达到最大 并且 依旧是执行选中操作
    if (selectLength >= MAX_SELECT_NUMBER && !img.isCheck) return;
    img.isCheck = !img.isCheck;
    setImageList([...imageList]);
  };
  const hidePreviewHandle = () => {
    setShowPreview(false);
  };

  useEffect(() => {
    const images = imageArray?.map((item, index) => ({ url: item, id: index }));
    switch (renderType) {
      case EType.RESULT_POP:
        setImageList(images.slice(0, maxShow as number));
        break;
      case EType.VIEW_ALL:
        setImageList(images);
        break;
      case EType.SELECT:
        setImageList(
          images.map((item) => ({
            isCheck: false,
            ...item,
          })),
        );
        break;
      default:
    }
  }, [renderType, maxShow, imageArray]);

  return (
    <View className={`image-wrapper ${resultPopClass} ${wrapperClass}`}>
      <View className="image-content">
        {imageList.map((item, index) => (
          <View key={index} onClick={() => onItemSelectHandle(item, index)} className="radio-item-container">
            <View className="radio-item">
              <Image
                src={item.url}
                mode="aspectFill"
                className={`radio-item-img ${renderType !== EType.RESULT_POP ? 'radio-item-unresult' : ''}`}
              />
              {isSelectType && (
                <View className="radio-item-operator">
                  <View
                    className={`radio check ${item.isCheck ? 'check-isCheck' : ''}`}
                    onClick={(e) => checkHandle(e, index)}
                  />
                  {item.isCheck || selectLength === MAX_SELECT_NUMBER ? (
                    <View className="radio-item-mask radio-item-operator-mask" />
                  ) : null}
                </View>
              )}
              {renderType === EType.RESULT_POP && restRenderNumber > 0 && index === maxShow - 1 && (
                <View className="radio-item-rest">
                  <Text className="text">+{restRenderNumber}</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>
      {showPreview && (
        <View className="previewModal" onClick={hidePreviewHandle}>
          <View className="header">
            {/* <View className="back" onClick={hidePreviewHandle} /> */}
            <View />
            <View
              className={`check ${imageList[currentImg].isCheck ? 'check-isCheck' : ''}`}
              onClick={(e) => checkHandle(e, currentImg)}
            />
          </View>
          <View className="img-content">
            <Swiper
              className="img-swiper"
              current={currentImg}
              onChange={(e) => {
                setCurrentImg(e.detail.current);
              }}
            >
              {imageList.map((item, index) => {
                return (
                  <SwiperItem key={index} className="img-swiper-item">
                    <Image mode="widthFix" src={item.url} className="show-img" />
                  </SwiperItem>
                );
              })}
            </Swiper>
          </View>
        </View>
      )}
      {isSelectType && (
        <BottomOperator>
          <Button
            onClick={onNextHandle}
            disabled={!selectLength}
            type="primary"
            className="next-step"
            hoverClass="none"
          >
            下一步（{`${selectLength}/${MAX_SELECT_NUMBER}`}）
          </Button>
        </BottomOperator>
      )}
    </View>
  );
};

export default ImageContent;
