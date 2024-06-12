import React, { useMemo } from 'react';
import { View, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import './index.less';

interface IImageDisplayProps {
  imageList: string;
}

const ImageDisplay: React.FC<IImageDisplayProps> = ({ imageList }) => {
  const images = JSON.parse(imageList || '[]');

  const className = useMemo(() => {
    if (images.length === 1) return 'full';
    if (images.length === 2) return 'half';
    return 'third';
  }, [images]);

  const handlePreviewImage = (currentUrl: string) => {
    Taro.previewImage({
      current: currentUrl, // 当前显示图片的链接
      urls: images, // 需要预览的图片链接列表
    });
  };

  return (
    <View className="beauty-answer-image-display">
      {images.map((item) => (
        <Image
          mode="aspectFill"
          className={className}
          src={item}
          key={item}
          onClick={() => handlePreviewImage(item)} // 添加点击事件
        />
      ))}
    </View>
  );
};

export default ImageDisplay;
