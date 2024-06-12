import React, { useMemo } from 'react';
import Taro from '@tarojs/taro';
import dayjs from 'dayjs';
import { PRE_EDU_PATH } from '@plugin/constants';
import { View, Image, type ITouchEvent, Video } from '@tarojs/components';
import type { IObserveListRes } from '@edu/request/type';
import './index.less';

export interface IContentBlockProps {
  showTimeLine?: boolean;
  contentItem: IObserveListRes;
  currentNav: number;
  isLatest: boolean;
}

const ContentBlock: React.FC<IContentBlockProps> = ({ showTimeLine, contentItem, currentNav, isLatest }) => {

  const handlePreviewImage = (e: ITouchEvent, currentUrl: string) => {
    e.stopPropagation();
    Taro.previewImage({
      current: currentUrl,
      urls: images,
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
      ...fixUrlToArr(contentItem.aiImgUrl),
      ...fixUrlToArr(contentItem.imgUrl)
    ].filter(Boolean).slice(0, 4 - videos.length);
  }, [contentItem, videos]);

  return (
    <View className="content-block" style={isLatest ? { marginTop: 30 } : {}}>
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
              images.map((photo) => (
                <Image mode="aspectFill" className="photo" key={photo} src={photo} onClick={(e) => handlePreviewImage(e, photo)} />
              ))
            }
          </View>
        </View>
      </View>
    </View>
  );
};

export default ContentBlock;
