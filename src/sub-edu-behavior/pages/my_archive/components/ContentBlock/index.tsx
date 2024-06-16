import React, { useMemo } from 'react';
import Taro from '@tarojs/taro';
import { EStorage } from '@plugin/types';
import dayjs from 'dayjs';
import { PRE_EDU_PATH } from '@plugin/constants';
import { View, Image, type ITouchEvent, Video } from '@tarojs/components';
import type { IObserveListRes } from '@sub-edu-behavior/request/type';
import './index.less';

export interface IContentBlockProps {
  showTimeLine?: boolean;
  contentItem: IObserveListRes;
  currentNav: number;
  selectedChildData?: string;
}

const ContentBlock: React.FC<IContentBlockProps> = ({ showTimeLine, contentItem, currentNav, selectedChildData }) => {

  const handlePreviewImage = (e: ITouchEvent, currentUrl: string) => {
    e.stopPropagation();
    Taro.previewImage({
      current: currentUrl,
      urls: images.map(i => i.url),
    });
  };

  const handlePreviewVideo = (e: ITouchEvent) => {
    e.stopPropagation();
    Taro.previewMedia({
      sources: videos.map((item) => {
        return {
          url: item.videoUrl,
          type: 'video',
          poster: item.videoCoverUrl,
        };
      }),
    });
  };

  const handleNavigate = () => {
    // 跳转之前先保存筛选的幼儿
    Taro.setStorageSync(EStorage.EDU_SELECTED_CHILD_DATA, selectedChildData);
    Taro.navigateTo({
      url: `${PRE_EDU_PATH}/${currentNav === 2 ? 'jot_down_detail' : 'observation_detail'}/index?observeId=${contentItem.observeId}`
    })
  }

  const fixUrlToArr = (url: string) => {
    if (url === 'null' || !url) return [];
    return url.split(',');
  }

  const videos = useMemo(() => {
    const videoCoverUrl = fixUrlToArr(contentItem.videoCoverUrl);
    const videoUrl = fixUrlToArr(contentItem.videoUrl);
    return videoUrl.filter(Boolean).map((v, index) => {
      return {
        videoUrl: v,
        videoCoverUrl: videoCoverUrl[index]
      }
    }).slice(0, 4);
  }, [contentItem]);

  const images = useMemo(() => {
    return [
      ...(fixUrlToArr(contentItem.aiImgUrl).map(url => ({ url, type: 'ai' }))),
      ...(fixUrlToArr(contentItem.imgUrl).map(url => ({ url, type: '' })))
    ].filter(Boolean).slice(0, 4 - videos.length);
  }, [contentItem, videos]);

  return (
    <View className="content-block">
      <View className="time-line">
        <View className="round" />
        <View className="line" style={{ visibility: showTimeLine ? 'visible' : 'hidden' }} />
      </View>
      <View className="right">
        <View className="time">{dayjs(contentItem.observeTime).format('HH:mm')}</View>
        <View
          className="content-wrapper" style={{ marginBottom: showTimeLine ? 20 : 0 }}
          onClick={handleNavigate}
        >
          <View className="content">{contentItem.content}</View>
          <View className="photos">
            {
              videos.map((video) => (
                <Video src={video.videoUrl} poster={video.videoCoverUrl} className="photo" key={video.videoCoverUrl} onClick={handlePreviewVideo} />
              ))
            }
            {
              images.map((i) => (
                <View key={i.url} className="image-item">
                  <Image mode="aspectFill" className="photo" key={i.url} src={i.url} onClick={(e) => handlePreviewImage(e, i.url)} />
                  {i.type === 'ai' && (
                    <Image
                      src="https://senior.cos.clife.cn/xiao-c/25DB1C54-F306-4104-BD5C-F607E0CDED08.png"
                      className="ai-tag"
                    />
                  )}
                </View>
              ))
            }
          </View>
        </View>
      </View>
    </View>
  );
};

export default ContentBlock;
