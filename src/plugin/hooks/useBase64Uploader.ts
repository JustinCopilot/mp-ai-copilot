import Taro, { base64ToArrayBuffer } from '@tarojs/taro';
import { getCosAuthApi } from '@plugin/request/common';
import { useState } from 'react';
import type { IPictureFrameList } from './useDrawPhoto';

// 对更多字符编码的 url encode 格式
const camSafeUrlEncode = (str: string) => {
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A');
};

const useBase64Uploader = () => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0); // 用于存储上传进度

  // 获取上传相关凭证
  const getUploadInfo = async (filePath: string) => {
    const exec = /data:image\/(jpg|png|jpeg);base64,/.exec(filePath);
    if (exec) {
      const pathData = filePath.replace(/data:image\/(jpg|png|jpeg);base64,/, '');
      const fileExt = exec[1];
      const authData = await getCosAuthApi({ ext: fileExt });
      const prefix = 'https://' + authData.cosHost;
      const key = authData.cosKey;
      return { prefix, pathData, key, authData, fileExt };
    }
  };

  const uploadHandle = async (files: IPictureFrameList[]) => {
    let uploadedCount = 0; // 已上传图片数量

    const uploadPromises = files.map(async (file) => {
      const uploadInfo = await getUploadInfo(file.url);
      console.log('=uploadInfo', uploadInfo);

      return new Promise((resolve, reject) => {
        if (uploadInfo) {
          const { prefix, pathData, key, authData } = uploadInfo;
          Taro.request({
            url: prefix + key,
            method: 'PUT',
            header: {
              Host: authData.cosHost,
              Authorization: authData.authorization,
              'x-cos-security-token': authData.securityToken,
              'Content-Type': 'application/octet-stream',
            },
            data: base64ToArrayBuffer(pathData),
            success: (res) => {
              const url = prefix + camSafeUrlEncode(key).replace(/%2F/g, '/');
              if (res.statusCode === 200) {
                uploadedCount++;
                setUploadProgress(Math.round((uploadedCount / files.length) * 100));
                resolve(url);
              } else {
                console.error('上传失败:');
              }
            },
            fail: function fail(res) {
              console.error('上传失败:', res);
            },
          });
        } else {
          reject(new Error('上传失败'));
        }
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

  // @TODO: 暂未实现
  const cancelUpload = () => {};

  return {
    isUploading,
    uploadedUrls,
    uploadProgress,
    uploadHandle,
    cancelUpload,
  };
};

export default useBase64Uploader;
