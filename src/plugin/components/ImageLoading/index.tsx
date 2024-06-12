import React, { useContext } from 'react';
import { View, Progress } from '@tarojs/components';
import { ChatWrapperContext } from '@plugin/stores/ChatWrapperContext';
import { LoadingImg } from '@plugin/components/PagIcon';
import './index.less';

const ImageLoading: React.FC = () => {
  const { imageUploader } = useContext(ChatWrapperContext) || {};

  return (
    <View className="image-loading">
      <View className="image-loading-top">
        <View>正在加载照片: </View>
        <View>{imageUploader?.uploadProgress}%</View>
      </View>
      <View className="image-loading-bottom">
        <LoadingImg />
        <Progress
          className="progress"
          activeColor="#716AE5"
          backgroundColor="#D3D8E0"
          percent={imageUploader?.uploadProgress}
          strokeWidth={2}
        />
      </View>
    </View>
  );
};

export default ImageLoading;
