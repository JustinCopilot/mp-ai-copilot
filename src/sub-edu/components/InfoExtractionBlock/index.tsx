import React, { useEffect, useMemo, useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Image, Video } from '@tarojs/components';
import type { IAgentResponseData } from '@sub-edu/request/type';
import { DEFAULT_AVATAR_BOY, DEFAULT_AVATAR_GIRL } from '@sub-edu/constants';
import './index.less';

export interface IIntelligentInfoExtractionProps {
  showMore?: boolean; // 是否显示「查看更多图片」按钮
  showStudents?: boolean; // 是否显示幼儿信息
  students: Pick<IAgentResponseData['student'][number], 'avatar' | 'studentId' | 'studentName' | 'sex'>[]; // 学生列表
  extractInfo: IAgentResponseData['extractInfo']; // 观察信息
}

const InfoExtractionBlock: React.FC<IIntelligentInfoExtractionProps> = ({
  showStudents = true,
  showMore,
  students,
  extractInfo,
}) => {
  const [showMoreVisible, setShowMoreVisible] = useState(false);

  const handleShowMore = () => {
    setShowMoreVisible(!showMoreVisible);
  };

  const handlePreviewImage = (currentUrl: string) => {
    Taro.previewImage({
      current: currentUrl,
      urls: images.map((i) => i.url),
    });
  };

  const generateSectorContent = (data: IAgentResponseData['extractInfo']['sectorList']) => {
    if (!data?.length) return '-';
    return data
      .map((sectorType) => {
        if (sectorType.area) {
          return `${sectorType.area}-${sectorType?.sub?.join(',')}`;
        } else if (sectorType.typeName) {
          return `${sectorType.typeName}-${sectorType.sectorList?.map((i) => i.sectorName)?.join(',')}`;
        } else {
          return '-';
        }
      })
      ?.join('、');
  };

  const previewVideoHandle = () => {
    Taro.previewMedia({
      sources: videoUrlList.map((item) => {
        return {
          url: item.videoUrl,
          type: 'video',
          poster: item.videoCoverUrl,
        };
      }),
    });
  };

  const videoUrlList = useMemo(() => {
    const vUrl = extractInfo?.photo?.videoUrl;
    return vUrl && vUrl !== 'null'
      ? [{
        videoUrl: extractInfo.photo.videoUrl,
        videoCoverUrl: extractInfo.photo.videoCoverUrl,
      }]
      : [];
  }, [extractInfo?.photo]);

  // 所有图片数据
  const images = useMemo(() => {
    if (!extractInfo?.photo) return [];
    const fixUrls = (urls, type) => {
      return (urls || '')
        .split(',')
        .filter(i => i && i !== 'null')
        .map((url) => ({ url, type }));
    }
    const { aiImgUrl = '', imgUrl = '' } = extractInfo.photo;
    const imagesArr = [...fixUrls(aiImgUrl, 'ai'), ...fixUrls(imgUrl, '')];
    return imagesArr;
  }, [extractInfo?.photo]);

  // 渲染的图片列表
  const renderImages = useMemo(() => {
    return showMoreVisible && images.length > 3 ? images.slice(0, 3) : images;
  }, [images, showMoreVisible])

  // 组件传参指定了需要展示更多按钮，并且图片超过3张时才展示「展开查看更多图片」按钮
  useEffect(() => {
    if (showMore && images.length > 3) {
      setShowMoreVisible(true);
    } else {
      setShowMoreVisible(false);
    }
  }, [showMore, images]);

  return (
    <View className="info-extraction-block">
      {showStudents && (
        <View className="child-info">
          {students?.map((i) => (
            <View key={i.studentId} className="child">
              <Image
                mode="aspectFill"
                src={i.avatar || (i.sex === 1 ? DEFAULT_AVATAR_BOY : DEFAULT_AVATAR_GIRL)}
                className="avatar"
              />
              <View className="name" style={students?.length < 4 ? { maxWidth: '140px' } : {}}>{i.studentName}</View>
            </View>
          ))}
        </View>
      )}

      <View className="observer">
        <View className="left">观察情境：</View>
        <View className="right">{extractInfo?.situationList?.join('、') || '-'}</View>
      </View>
      <View className="observer">
        <View className="left">观察时间：</View>
        <View className="right">{extractInfo?.date || '-'}</View>
      </View>
      <View className="observer">
        <View className="left">关联领域：</View>
        <View className="right">{generateSectorContent(extractInfo?.sectorList)}</View>
      </View>
      <View className="observer">
        <View className="left">观察内容：</View>
        <View className="right">{extractInfo?.input || '-'}</View>
      </View>

      <View className="observer-image-container">
        {(extractInfo?.photo?.aiImgUrl || extractInfo?.photo?.imgUrl) &&
          renderImages.map((i) => (
            <View key={i.url} className="image-item">
              <Image
                mode="aspectFill"
                src={i.url}
                className="observer-image"
                onClick={() => handlePreviewImage(i.url)}
              />
              {i.type === 'ai' && (
                <Image
                  src="https://senior.cos.clife.cn/xiao-c/25DB1C54-F306-4104-BD5C-F607E0CDED08.png"
                  className="ai-tag"
                />
              )}
            </View>
          ))}
        {videoUrlList.map((i) => (
          <View key={i.videoUrl} className="image-item">
            <Video src={i.videoUrl} poster={i.videoCoverUrl} className="observer-image" onClick={previewVideoHandle} />
          </View>
        ))}
      </View>

      {showMoreVisible && (
        <View className="show-more" onClick={handleShowMore}>
          <View className="tip">展开查看更多图片</View>
          <View className="icon" />
        </View>
      )}
    </View>
  );
};

export default InfoExtractionBlock;
