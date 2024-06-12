import React, { useContext, useState } from 'react';
import { View } from '@tarojs/components';
import type { IChatComponentInParam, IComponentInParamSelectValue } from '@plugin/request/chat/type';
import { ChatWrapperContext } from '@plugin/stores/ChatWrapperContext';
import './index.less';
import { ECheckStatus } from '../ChatWrapper';

export interface ICheckAnswerProps {
  componentInParam: IChatComponentInParam;
  isLastAnswer: boolean;
}

const CheckAnswer = ({ componentInParam, isLastAnswer }: ICheckAnswerProps) => {
  const { getAnswerResult, checkStatus } = useContext(ChatWrapperContext) || {};
  const [activeCurrent, setActiveCurrent] = useState<number>();
  const disabledCheck = !isLastAnswer || checkStatus === ECheckStatus.NEW_SESSION;

  const checkClickHandle = (item: IComponentInParamSelectValue, index: number) => {
    if (disabledCheck) return;
    setActiveCurrent(index);
    getAnswerResult?.(
      {
        query: item.name || item.className || item.studentName || '',
        inParamFlag: true,
        param: {
          [componentInParam.paramCode]: item,
        },
      },
      { needPutAnsker: false },
    );
  };

  return (
    <View className="check-answer">
      <View>{componentInParam.prefix}</View>
      <View className="check-list">
        {componentInParam.selectValue?.map((item, index) => {
          return (
            <View
              className={`check-item ${disabledCheck ? 'isCheck' : ''}`}
              key={index}
              onClick={() => checkClickHandle(item, index)}
            >
              <View
                className={`avatar ${activeCurrent === index ? 'active' : ''}`}
                style={{
                  backgroundImage: `${item.avatar ? `url("${item.avatar}")` : 'url("https://senior.cos.clife.cn/xiao-c/07fd496d-4915-49cb-a987-98bbff38e576-class@2x.png")'}`,
                }}
              />
              <View className="name">{item.name || item.className || item.studentName}</View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default CheckAnswer;
