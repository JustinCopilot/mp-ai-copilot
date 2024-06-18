import React, { useEffect, useContext, useRef, useState } from 'react';
import Taro from '@tarojs/taro';
import { Canvas, Image, View } from '@tarojs/components';
import { PAGInit } from 'libpag-miniprogram';
import type { PAG } from 'libpag-miniprogram/types/types';
import type { PAGView } from 'libpag-miniprogram/types/pag-view';

interface IPagIconProps {
  pagSrc: string;
  width: number;
  height: number;
  canvasId: string;
  play?: boolean;
  style?: any;
  imageSrc?: string;
  imageStyle?: Record<string, any>;
}

let initLock = false;
let pagInitPromise: Promise<PAG>;

/**
 * 对PAGInit进行一次封装，同时触发PAGInit时，实际仅调用一次
 * @returns pagInitPromise:Promise<PAG>
 */
const pagInit = async (): Promise<PAG> => {
  if (initLock) return pagInitPromise;
  initLock = true;
  pagInitPromise = PAGInit({
    locateFile: (file) => `${process.env.TARO_APP_PACK_INDEPENDENT_SUB ? 'xiao-c/' : ''}sub-pag/utils/` + file,
  });
  return pagInitPromise;
};

const PagIcon: React.FC<IPagIconProps> = (props) => {
  const { pagSrc, width, height, canvasId, play = true, style, imageSrc, imageStyle } = props;
  const query = Taro.createSelectorQuery().in(Taro.getCurrentInstance().page!);
  const pagViewRef = useRef<PAGView | undefined>();
  const [pagViewRefState, setPagViewRefState] = useState(false);
  const [hasPagFile, setHasPagFile] = useState(true);

  useEffect(() => {
    query
      .select(`#${canvasId}`)
      ?.node()
      ?.exec(async (res) => {
        const canvas = res[0]?.node;
        if (!canvas || !pagSrc) return;

        const buffer = await loadFileByRequest(pagSrc);
        const pag = await pagInit();
        const pagFile = await pag?.PAGFile?.load(buffer);
        if (pagFile) {
          let pagView = await pag?.PAGView?.init(pagFile, canvas);
          setPagViewRefState(true);
          pagViewRef.current = pagView;
          pagViewRef.current?.setRepeatCount(Infinity);
          pagViewRef.current?.setCacheEnabled(false);
          // play && pagViewRef.current?.play();
        } else {
          setHasPagFile(false);
        }
      });
    return () => {
      pagViewRef.current?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!pagViewRefState) return;
    if (play) {
      pagViewRef.current?.play();
    } else {
      pagViewRef.current?.pause();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [play, pagViewRefState]);

  const loadFileByRequest = async (url) => {
    return new Promise((resolve) => {
      Taro.request({
        url,
        method: 'GET',
        responseType: 'arraybuffer',
        success: (res) => {
          if (res.statusCode !== 200) {
            resolve(null);
          }
          resolve(res.data);
        },
        fail: () => {
          resolve(null);
        },
      });
    });
  };
  if (!hasPagFile) return imageSrc ? <Image style={imageStyle} src={imageSrc} /> : <View />;
  return <Canvas type="webgl" id={canvasId} style={{ width: width + 'rpx', height: height + 'rpx', ...style }} />;
};

export default PagIcon;
