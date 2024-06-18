/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC } from 'react';
import { View, Text, Image } from '@tarojs/components';
import 'taro-ui/dist/style/components/float-layout.scss';
import { AtFloatLayout } from 'taro-ui';
import { DEFAULT_AVATAR_BOY, DEFAULT_AVATAR_GIRL } from '@sub-edu-behavior/constants';
import { Props } from './config';
import './index.less';

export * from './config';
const closeImg = 'https://senior.cos.clife.cn/xiao-c/icon-close-tag-selecter.png';

export const SelectChildPicer: FC<Props> = ({ studentList, onChange, children, show = false, onClose }) => {
  return (
    <View className="select-child-picker-wrap">
      <View className="select-child-picker" onClick={onClose}>
        {children}
      </View>
      <AtFloatLayout isOpened={show} className="select-child-picker-modal" onClose={onClose}>
        <View className="select-child-picker-modal-content">
          <View className="modal-title">
            <Text>选择幼儿</Text>
            <Image src={closeImg} className="modal-title-close " onClick={onClose} />
          </View>
          <View className="student-list">
            {studentList?.map((item) => {
              const { studentId, studentName, avatar, sex } = item || {};
              return (
                <View
                  className="student-item"
                  key={studentId}
                  onClick={() => {
                    onChange?.(studentId, item);
                  }}
                >
                  <View className="student-base-info">
                    <Image
                      src={avatar || (sex === 1 ? DEFAULT_AVATAR_BOY : DEFAULT_AVATAR_GIRL)}
                      className="student-item-avatar"
                    />
                    <Text className="student-item-name">{studentName}</Text>
                  </View>
                  <View className="at-icon at-icon-chevron-right" />
                </View>
              );
            })}
          </View>
        </View>
      </AtFloatLayout>
    </View>
  );
};

export default SelectChildPicer;
