import { Button, View } from '@tarojs/components';
import React, { ReactNode } from 'react';
import { AtModal, AtModalAction } from 'taro-ui';
import 'taro-ui/dist/style/components/modal.scss';
import './index.less';

export interface IAlertModalProps {
  isOpened: boolean;
  closeHandle: () => void;
  okHandle: () => void;
  title?: string;
  content?: ReactNode;
  cancelText?: string;
  okText?: string;
}

const AlertModal = ({
  isOpened,
  closeHandle,
  okHandle,
  title,
  content,
  cancelText = '取消',
  okText = '确定',
}: IAlertModalProps) => {
  return (
    <AtModal isOpened={isOpened} onClose={closeHandle}>
      <View className="alert-modal-content">
        <View className="header">{title}</View>
        <View className="content">{content}</View>
      </View>
      <AtModalAction>
        <Button onClick={closeHandle}>{cancelText}</Button>
        <Button onClick={okHandle}>{okText}</Button>
      </AtModalAction>
    </AtModal>
  );
};
export default AlertModal;
