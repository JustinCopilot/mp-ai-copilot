import PagIcon from './Base';

// 语音图标静默状态
const StaticVoice = (props) => {
  return (
    <PagIcon
      canvasId="StaticVoice"
      width={220}
      height={240}
      // pagSrc="https://senior.cos.clife.cn/xiao-c/01jingmo-zhuangtai.pag"
      pagSrc="https://senior.cos.clife.cn/xiao-c/xiao-c-no-shadow.pag"
      style={{ background: "url('https://senior.cos.clife.cn/xiao-c/icon-xiaoc-shadow.png')", backgroundSize: '100%' }}
      {...props}
      imageSrc="https://senior.cos.clife.cn/xiao-c/voice_btn@2x.png"
      imageStyle={{ width: '90px', height: '100px', marginTop: '20px', marginLeft: '20px' }}
    />
  );
};

export default StaticVoice;
