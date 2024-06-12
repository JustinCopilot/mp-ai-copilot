import Taro from '@tarojs/taro';
import { getCosAuthApi } from '@plugin/request/common';
import { useState, useRef } from 'react';

enum EMediaType {
  /** 只能拍摄视频或从相册选择视频 */
  video = 'video',
  /** 只能拍摄图片或从相册选择图片 */
  image = 'image',
  /** 可同时选择图片和视频 */
  mix = 'mix',
}

interface IChooseImageProps {
  count?: number;
  mediaType?: Array<EMediaType>;
}

const useImageUploader = () => {
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const requestTasksRef = useRef<Taro.RequestTask<any>>();

  const chooseImage = async ({ count = 9, mediaType = [EMediaType.image] }: IChooseImageProps = {}) => {
    setUploadProgress(0);
    setIsUploading(true);
    try {
      Taro.chooseMedia({
        count,
        mediaType,
        sizeType: ['original', 'compressed'],
        sourceType: ['album'],
        success: (res) => {
          if (res) {
            setImages(res.tempFiles.map((i) => i.tempFilePath));
            uploadImages(res.tempFiles);
          }
        },
      });
    } catch (error) {
      setIsUploading(false);
      console.error('Choosing images failed:', error);
    }
  };

  // 获取上传相关凭证
  const getUploadInfo = async (filePath: string) => {
    const extIndex = filePath.lastIndexOf('.');
    const fileExt = extIndex >= -1 ? filePath.substr(extIndex + 1) : '';

    const authData = await getCosAuthApi({ ext: fileExt });
    const prefix = `https://${authData.cosHost}`;
    const key = authData.cosKey;
    return { prefix, filePath, key, authData };
  };

  const uploadImages = async (files: { tempFilePath: string }[]) => {
    let uploadedCount = 0; // 已上传图片数量

    const uploadPromises = files.map(async (file) => {
      const uploadInfo = await getUploadInfo(file.tempFilePath);
      const { prefix, filePath, key, authData } = uploadInfo;

      return new Promise<string>((resolve, reject) => {
        // put上传需要读取文件的真实内容来上传
        const wxfs = Taro.getFileSystemManager();
        wxfs.readFile({
          filePath,
          success: (fileRes) => {
            requestTasksRef.current = Taro.request({
              url: prefix + key,
              method: 'PUT',
              header: {
                Authorization: authData.authorization,
                'x-cos-security-token': authData.securityToken,
                'Content-Type': 'application/octet-stream',
              },
              data: fileRes.data,
              success: (res) => {
                const url = `${prefix}/${camSafeUrlEncode(key).replace(/%2F/g, '/')}`;
                if (res.statusCode === 200) {
                  uploadedCount++;
                  setUploadProgress(Math.round((uploadedCount / files.length) * 100));
                  resolve(url);
                } else {
                  console.error('上传失败');
                  reject(new Error('上传失败'));
                }
              },
              fail: (err) => {
                console.error('上传失败:', err);
                if (err.errMsg.includes('abort')) {
                  Taro.showToast({ title: '已取消上传', icon: 'none' });
                }
                reject(err);
              },
            });
          },
        });
      });
    });

    Promise.all(uploadPromises)
      .then((urls: string[]) => {
        console.log('%c [ urls ]', 'font-size:13px; background:pink; color:#bf2c9f;', urls);
        setUploadedUrls(urls);
        setIsUploading(false);
      })
      .catch((error) => {
        console.error('Upload images failed:', error);
        Taro.showToast({ title: '上传失败', icon: 'error' });
      })
      .finally(() => {
        setIsUploading(false);
      });
  };

  const cancelUpload = () => {
    requestTasksRef.current?.abort();
    setIsUploading(false);
  };

  return {
    images,
    isUploading,
    uploadedUrls,
    uploadProgress,
    chooseImage,
    cancelUpload,
  };
};

// 对更多字符编码的 url encode 格式
const camSafeUrlEncode = (str: string) => {
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A');
};

export default useImageUploader;
