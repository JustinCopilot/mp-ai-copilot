/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useEffect, useMemo } from 'react';
import { Image, Video, View } from '@tarojs/components';
import type { ChildProps } from '@edu/components';
import useImageUploader from '@plugin/hooks/useImageUploader';
import Taro from '@tarojs/taro';
import './index.less';
import ModuleTitle from '../module-title';

export enum EPhotoType {
  AI = 'ai',
  IMG = 'img',
  VIDEO = 'video',
}

const closeIcon = 'https://senior.cos.clife.cn/xiao-c/close.png';
const aiTagUrl = 'https://senior.cos.clife.cn/xiao-c/25DB1C54-F306-4104-BD5C-F607E0CDED08.png';
/** 观察照片 */
export const AnalysePhoto: FC<ChildProps> = ({ dispatch, state }) => {
  const { chooseImage, uploadedUrls } = useImageUploader();
  // console.log('🚀🚀🚀🚀🚀🚀  images:', images);
  const { observePhoto } = state || {};
  // console.log('🚀🚀🚀🚀🚀🚀  observePhoto:', observePhoto);
  const { aiImgUrl, imgUrl, videoCoverUrl, videoUrl } = observePhoto || {};
  const ais = (aiImgUrl?.split(',') || [])?.filter(Boolean).map((item) => ({ type: EPhotoType.AI, url: item }));
  const imgs = (imgUrl?.split(',') || [])?.filter(Boolean).map((item) => ({ type: EPhotoType.IMG, url: item }));
  const imgList = useMemo(() => {
    return [...ais.map((i) => i.url), ...imgs.map((i) => i.url)];
  }, [ais, imgs]);
  const videoUrlList = videoUrl
    ? [
        {
          type: EPhotoType.VIDEO,
          url: videoUrl,
          coverUrl: videoCoverUrl,
        },
      ]
    : [];
  const all = [ais, imgs].flat(2)?.filter(Boolean);
  // console.log('🚀🚀🚀🚀🚀🚀  all:', all);

  useEffect(() => {
    // dispatch('observePhoto', [...all, ...images.slice(0, 9 - all?.length)]);
    const list = imgUrl ? [imgUrl, ...uploadedUrls] : [...uploadedUrls];
    dispatch('observePhoto', { ...observePhoto, imgUrl: list?.join(',') });
  }, [uploadedUrls]);

  /** 删除 */
  const onDelete = (index: number, type: EPhotoType) => {
    const aiImgs = [...ais];
    const images = [...imgs];
    const videos = [...videoUrlList];
    switch (type) {
      case EPhotoType.AI:
        aiImgs.splice(index, 1);
        break;
      case EPhotoType.IMG:
        images.splice(index, 1);
        break;
      case EPhotoType.VIDEO:
        videos.splice(index, 1);
        break;

      default:
        break;
    }
    dispatch('observePhoto', {
      aiImgUrl: aiImgs.map((item) => item.url).join(','),
      imgUrl: images.map((item) => item.url).join(','),
      videoCoverUrl: videos.map((item) => item.coverUrl).join(','),
      videoUrl: videos.map((item) => item.url).join(','),
    });
  };
  /** 预览图片 */
  const handlePreviewImage = (currentUrl: string) => {
    Taro.previewImage({
      current: currentUrl,
      urls: imgList,
    });
  };
  const previewVideoHandle = () => {
    Taro.previewMedia({
      sources: videoUrlList.map((item) => {
        return {
          url: item.url,
          type: 'video',
          poster: item.coverUrl,
        };
      }),
    });
  };
  return (
    <View className="analyse-photo-container">
      <ModuleTitle title="观察照片" />
      <View className="photo-list">
        {ais?.map((item, key) => (
          <View className="abserve-photo-item" key={key}>
            <Image src={item.url} className="abs-photo" onClick={() => handlePreviewImage(item.url)} />
            <Image src={closeIcon} className="abs-delete" onClick={() => onDelete(key, item.type)} />
            <Image src={aiTagUrl} className="abs-ai" />
          </View>
        ))}
        {imgs?.map((item, key) => (
          <View className="abserve-photo-item" key={key}>
            <Image src={item.url} className="abs-photo" onClick={() => handlePreviewImage(item.url)} />
            <Image src={closeIcon} className="abs-delete" onClick={() => onDelete(key, item.type)} />
          </View>
        ))}
        {videoUrlList?.map((item, key) => (
          <View className="abserve-photo-item" key={key}>
            <Video src={item.url} poster={item.coverUrl} className="abs-photo" onClick={previewVideoHandle} />
            <Image src={closeIcon} className="abs-delete" onClick={() => onDelete(key, item.type)} />
          </View>
        ))}
        {all?.length < 9 && !videoUrl && (
          <View className="upload-btn" onClick={() => chooseImage({ count: 9 - all.length })}>
            <View className="at-icon at-icon-add" />
          </View>
        )}
      </View>
    </View>
  );
};

export default AnalysePhoto;
