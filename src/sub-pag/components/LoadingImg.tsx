import PagIcon from './Base';

// 图片加载
const LoadingImg = () => {
  return (
    <PagIcon
      canvasId="LoadingImg"
      width={90 * 2}
      height={44 * 2}
      pagSrc="https://senior.cos.clife.cn/xiao-c/image-progress.pag"
    />
  );
};

export default LoadingImg;
