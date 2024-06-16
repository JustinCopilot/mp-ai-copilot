import type { ISynthesisImg } from '@plugin/pages/synthesis/synthesis';
import Taro from '@tarojs/taro';
import { useRef, useState } from 'react';

export interface IPictureFrameList {
  loading: boolean;
  errorCode: number;
  url: string;
}

const CANVAS_WIDTH = 270 * 5;
const CANVAS_HEIGHT = 360 * 5;
const CANVAS_W_H_RATIO = CANVAS_WIDTH / CANVAS_HEIGHT;

const useDrawPicture = () => {
  const [pictureFrameList, setPictureFrameList] = useState<IPictureFrameList[]>([]);
  const pictureFrameListRef = useRef<IPictureFrameList[]>([]);

  function drawImage(mainImg: string, frameImg: string) {
    return new Promise<string>((resolve, reject) => {
      const canvas = Taro.createOffscreenCanvas({ type: '2d', width: CANVAS_WIDTH, height: CANVAS_HEIGHT });
      const context = canvas.getContext('2d');

      // 获取网络图片信息
      Taro.getImageInfo({
        src: mainImg,
        fail: (err) => {
          reject(err);
        },
        success: async (mainImgData) => {
          const mainImgCanvas = canvas.createImage();
          await new Promise((resolve) => {
            mainImgCanvas.onload = resolve;
            mainImgCanvas.src = mainImgData.path;
          });

          console.log('mainImgData=', mainImgData);
          const mainImgWidth = mainImgData.width;
          const mainImgHeight = mainImgData.height;
          let [w_edge, h_edge, x, y] = [mainImgWidth, mainImgHeight, 0, 0];

          const orientation = mainImgData.orientation;
          if (['up', 'down'].includes(orientation)) {
            // 宽高计算
            if (CANVAS_W_H_RATIO <= mainImgWidth / mainImgHeight) {
              // 宽度超出宽高比例
              w_edge = mainImgHeight * CANVAS_W_H_RATIO;
              x = (mainImgWidth - w_edge) / 2;
              y = 0;
            } else {
              // 高度超出宽高比例
              h_edge = mainImgWidth / CANVAS_W_H_RATIO;
              x = 0;
              y = (mainImgHeight - h_edge) / 2;
            }

            if (orientation === 'down') {
              context.translate(CANVAS_WIDTH, CANVAS_HEIGHT);
              context.rotate((180 * Math.PI) / 180);
            }
            context.drawImage(mainImgCanvas, x, y, w_edge, h_edge, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
          } else if (['left', 'right'].includes(orientation)) {
            // 宽高计算，对于左右方向的图片，宽高信息对调，即：图片H=显示W，图片W=显示H
            if (CANVAS_W_H_RATIO <= mainImgHeight / mainImgWidth) {
              // 宽度超出宽高比例
              w_edge = mainImgHeight;
              h_edge = mainImgHeight / CANVAS_W_H_RATIO;
              x = 0;
              y = (mainImgWidth - h_edge) / 2;
            } else {
              // 高度超出宽高比例
              w_edge = mainImgHeight * CANVAS_W_H_RATIO;
              h_edge = mainImgWidth;
              x = (mainImgHeight - w_edge) / 2;
              y = 0;
            }

            if (orientation === 'right') {
              context.translate(CANVAS_WIDTH, 0);
              context.rotate((90 * Math.PI) / 180);
            }
            if (orientation === 'left') {
              context.translate(0, CANVAS_HEIGHT);
              context.rotate((270 * Math.PI) / 180);
            }
            // 图片裁剪的宽高也需要对调一下
            context.drawImage(mainImgCanvas, x, y, h_edge, w_edge, 0, 0, CANVAS_HEIGHT, CANVAS_WIDTH);
          }
          // context.drawImage(图源, 图源裁剪的左上角X坐标, 图源裁剪的左上角y坐标, 图源裁剪宽度, 图源裁剪高度, 裁剪图源在画布上的x坐标, 裁剪图源在画布上的y坐标, 在画布上绘制的裁剪图源宽度, 在画布上绘制的裁剪图源高度);
          // context.drawImage(mainImgCanvas, x, y, w_edge, h_edge, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

          // 画布旋转完之后需要重新旋转回原方位
          if (orientation === 'down') {
            context.translate(CANVAS_WIDTH, CANVAS_HEIGHT);
            context.rotate((180 * Math.PI) / 180);
          }
          if (orientation === 'right') {
            context.translate(0, CANVAS_WIDTH);
            context.rotate((270 * Math.PI) / 180);
          }
          if (orientation === 'left') {
            context.translate(CANVAS_HEIGHT, 0);
            context.rotate((90 * Math.PI) / 180);
          }

          // 获取相框图片信息
          if (frameImg) {
            Taro.getImageInfo({
              src: frameImg,
              fail: (err) => {
                reject(err);
              },
              success: async (frameImgData) => {
                const frameImgCanvas = canvas.createImage();
                await new Promise((resolve) => {
                  frameImgCanvas.onload = resolve;
                  frameImgCanvas.src = frameImgData.path;
                });
                const frameImgHeight = frameImgData.height;
                const frameImgWidth = frameImgData.width;
                context.drawImage(
                  frameImgCanvas,
                  0,
                  0,
                  frameImgWidth,
                  frameImgHeight,
                  0,
                  0,
                  CANVAS_WIDTH,
                  CANVAS_HEIGHT,
                );
                const canvasDataUrl = canvas.toDataURL();
                resolve(canvasDataUrl);
              },
            });
          } else {
            const canvasDataUrl = canvas.toDataURL();
            resolve(canvasDataUrl);
          }
        },
      });
    });
  }

  async function mapPicture(imgList: ISynthesisImg[]) {
    const defaultData = imgList.map((item) => ({
      loading: true,
      errorCode: 0,
      url: item.mainImg,
    }));
    // setPictureFrameList(defaultData);
    pictureFrameListRef.current = defaultData;
    try {
      for (let index = 0; index < imgList.length; index++) {
        const imgConfig = imgList[index];
        const imgUrl = await drawImage(imgConfig.mainImg, imgConfig.frameImg);

        pictureFrameListRef.current[index] = {
          loading: false,
          errorCode: 0,
          url: imgUrl,
        };
      }
      setPictureFrameList([...pictureFrameListRef.current]);
    } catch (error) {
      setPictureFrameList([
        ...pictureFrameListRef.current.map((item) => {
          item.errorCode = 1;
          return item;
        }),
      ]);
    }
  }

  return {
    mapPicture,
    pictureFrameList,
  };
};
export default useDrawPicture;
