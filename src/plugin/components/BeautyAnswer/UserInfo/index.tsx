import React from 'react';
import { View, Image } from '@tarojs/components';
import type { IChatItem } from '@plugin/components/ChatWrapper';
import './index.less';

export interface IImageAnswerProps {
  beautyUserInfo: IChatItem['beautyUserInfo'];
}

const BeautyAnswerUserInfo = ({ beautyUserInfo: info = {} }: IImageAnswerProps) => {
  let tags: Array<string | number> = [];
  info.age && tags.push(info.age + '岁');
  info.project && tags.push(info.project);
  info.time && tags.push(info.time);

  const defaultImage = {
    1: 'https://senior.cos.clife.cn/xiao-c/avatar-default.png',
    2: 'https://senior.cos.clife.cn/xiao-c/avatar-default.png',
  };

  let avatarImage = info.avatar ? info.avatar : defaultImage[info.gender];
  return (
    <View className="beauty-answer-userinfo">
      <Image className="avatar" src={avatarImage} />
      <View className="info">
        <View className="info-top">
          <View className="name">{info.name}</View>
          <View className={info.gender === 2 ? 'female' : 'male'} />
        </View>
        <View className="info-bottom">
          {info.age && (
            <>
              <View className="divider" />
              <View className="item">{info.age}岁</View>
            </>
          )}
          {info.project && (
            <>
              <View className="divider" />
              <View className="item">{info.project}</View>
            </>
          )}
          {info.time && (
            <>
              <View className="divider" />
              <View className="item">{info.time}</View>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

export default BeautyAnswerUserInfo;
