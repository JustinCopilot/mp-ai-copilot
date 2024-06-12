import React, { useState } from 'react';
import Taro from '@tarojs/taro';
import { ELikeType } from '@plugin/request/chat/type';
import { View, Textarea } from '@tarojs/components';
import './index.less';

export interface IDislikeDialog {
  onClose: () => void;
  handlePutFeedback: (like: ELikeType, reason: string) => void;
}
const reasons = [
  { value: ELikeType.UNHELP, label: '没有帮助' },
  { value: ELikeType.FRAUDULENTLY, label: '信息虚假' },
  { value: ELikeType.UNSAFE, label: '有害/不安全' },
  { value: ELikeType.OTHER, label: '其他' },
];

const DislikeDialog = ({ onClose, handlePutFeedback }: IDislikeDialog) => {
  const [selectedReason, setSelectedReason] = useState<ELikeType | null>(null);
  const [feedbackText, setFeedbackText] = useState('');

  const handleSelectReason = (reason: ELikeType) => {
    setSelectedReason(reason);
  };

  // 选中reasons或有输入文字，满足任意一项即可提交
  // const isSubmitEnabled = selectedReason !== null || feedbackText.trim().length > 0;
  const handleSubmit = () => {
    // if (!isSubmitEnabled) return;
    setTimeout(() => {
      Taro.showToast({
        title: '感谢您的反馈',
        icon: 'none',
        duration: 1500,
      });
      onClose();
    }, 300);
    handlePutFeedback(selectedReason!, feedbackText);
  };

  return (
    <View className="dislike_dialog_container">
      <View className="dislike_dialog_title">
        <View className="label">反馈</View>
        <View className="close" onClick={onClose} />
      </View>
      <View className="dislike_dialog_reason">
        {reasons.map((reason) => (
          <View
            key={reason.value}
            className={`reason ${selectedReason === reason.value ? 'selected' : ''}`}
            onClick={() => handleSelectReason(reason.value)}
          >
            {reason.label}
          </View>
        ))}
      </View>
      <View className="dislike_dialog_feedback">
        <Textarea
          placeholderStyle="color: #9296A6;"
          placeholder="我们想知道你对此回答感到不满意的原因。你也可以提供一个更好的答案来帮助我们改进。"
          // @ts-ignore
          onInput={(e) => setFeedbackText(e.target.value)}
          maxlength={500}
          cursorSpacing={150}
          showConfirmBar={false}
        />
      </View>
      <View className="dislike_dialog_submit enabled" onClick={handleSubmit}>
        提交
      </View>
    </View>
  );
};

export default DislikeDialog;
