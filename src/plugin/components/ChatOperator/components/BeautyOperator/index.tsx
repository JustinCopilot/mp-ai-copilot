import React, { useContext } from 'react';
import Taro, { getCurrentPages } from '@tarojs/taro';
import { View, Button } from '@tarojs/components';
import { ChatWrapperContext } from '@plugin/stores/ChatWrapperContext';
import type { EMicroAppUuid } from '@plugin/request/chat/type';
import { EAnswerStatus } from '@plugin/components/ChatWrapper';
import type { IBeautySummaryReturnParams } from '@plugin/types';
import { EOperateState } from '../..';
import './index.less';

interface IBeautyOperatorProps {
  handleNewSession?: () => void;
}

const BeautyOperator: React.FC<IBeautyOperatorProps> = ({ handleNewSession }) => {
  const { microAppUuid, operateState, answerStatus, summaryCallbackData } = useContext(ChatWrapperContext) || {};

  const handleSummaryConfirm = () => {
    if (answerStatus !== EAnswerStatus.UN_ANSWER) {
      return Taro.showToast({
        title: '正在回复中',
        icon: 'none',
      });
    }
    const pages = getCurrentPages();
    const current = pages[pages.length - 1];
    const eventChannel = current.getOpenerEventChannel();
    const returnData: IBeautySummaryReturnParams = {
      microAppUuid: microAppUuid as EMicroAppUuid.BEAUTY_SUMMARY,
      data: summaryCallbackData,
    };
    eventChannel.emit('Return', returnData);
    Taro.navigateBack();
  };

  return (
    <View className="beauty-operator">
      {operateState === EOperateState.SELECT_RETURN_VISIT_WAY && <View className="tip-text">请选择回访方式</View>}
      {operateState === EOperateState.NEW_SESSION && (
        <View className="open-new-session" onClick={() => handleNewSession?.()}>
          重新开始会话
        </View>
      )}
      {operateState === EOperateState.SELECT_COMMAND && <View className="tip-text">请选择指令</View>}
      {operateState === EOperateState.RETURN_VISIT_SUMMARY_CONFIRM && (
        <View className="summary-confirm">
          <View className="tip">确认后，将直接填写至用户回访总结内容中</View>
          <Button className="confirm-btn" onClick={handleSummaryConfirm}>
            回访总结确认
          </Button>
        </View>
      )}
    </View>
  );
};

export default BeautyOperator;
