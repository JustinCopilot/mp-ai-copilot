import { useRef } from 'react';
import type { IPutChatRes } from '@plugin/request/chat/type';
// import { TextDecoder } from 'text-encoding-shim';
import type { RequestTask } from '@tarojs/taro';
import TextDecoder from '@common/utils/decode';

const useStreamToArray = () => {
  const preChunkAnswer = useRef<string>('');

  function transformStreamToArray(stream: RequestTask.onChunkReceived.CallbackResult) {
    const uint8Array = new Uint8Array(stream.data);
    const streamDataStr = new TextDecoder('utf-8').decode(uint8Array);
    // 返回空数据，无需处理，退出
    if (!streamDataStr.trim()) return;

    // 微信小程序会对流式会话的数据进行组合/拆解处理返回，导致JSON.parse解析失败，所以需要进行数据拼接
    const streamDataArr: IPutChatRes[] = streamDataStr
      .split('\n')
      .filter(Boolean)
      .map((item) => {
        if (!preChunkAnswer.current && item.startsWith('data:')) {
          try {
            return JSON.parse(item.slice(5));
          } catch (error) {
            preChunkAnswer.current = item.slice(5);
            return undefined;
          }
        }

        let parseStream = {};
        try {
          parseStream = JSON.parse(preChunkAnswer.current + item);
        } catch (error) {
          preChunkAnswer.current += item;
          return undefined;
        }

        // 解析成功，将json字符串置空
        preChunkAnswer.current = '';
        return parseStream;
      }).filter(Boolean);
    // 如果存在待拼接的json字符串，则退出等待下次结果返回
    if (preChunkAnswer.current) return;

    return streamDataArr;
  }

  return {
    transformStreamToArray,
  };
};

export default useStreamToArray;
