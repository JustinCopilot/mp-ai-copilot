import React, { useState, useEffect } from 'react';
import { View } from '@tarojs/components';
import './index.less';

export interface IBottomDialogProps {
  content?: React.ReactNode;
  isVisible: boolean;
}

const BottomDialog: React.FC<IBottomDialogProps> = ({ content, isVisible }) => {
  const [showDialog, setShowDialog] = useState(isVisible);
  useEffect(() => {
    setShowDialog(isVisible);
  }, [isVisible]);

  return <View className={`bottom_dialog_container ${showDialog ? 'slide-up' : 'slide-down'}`}>{content}</View>;
};

export default BottomDialog;
