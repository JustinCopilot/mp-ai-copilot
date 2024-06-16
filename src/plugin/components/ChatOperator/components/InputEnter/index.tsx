import React, { useContext, useState, useRef, useEffect } from 'react';
import { View, Input } from '@tarojs/components';
import useGetScenes from '@plugin/hooks/useGetScenes';
import { ChatWrapperContext } from '@plugin/stores/ChatWrapperContext';
import { EOperateState } from '../..';
import ImageUpload from '../ImageUpload';
import './index.less';

interface IInputEnterProps {
  externalQuestionStr: string;
  externalQuestionUUID: string;
  handleSend: (content: string) => void;
}

const InputEnter: React.FC<IInputEnterProps> = ({ handleSend, externalQuestionStr, externalQuestionUUID }) => {
  const { microAppUuid, changeOperateState, questionStrChange } = useContext(ChatWrapperContext) || {};
  const { isBeautySummaryScenes } = useGetScenes(microAppUuid);
  const [isNeedFocus, setIsNeedFocus] = useState(true);

  const inputRef = useRef(null);
  const [questionStr, setQuestionStr] = useState<string>(externalQuestionStr);

  const handleInput = (event) => {
    setQuestionStr(event.target.value);
  };

  const handleClose = () => {
    setQuestionStr('');
    questionStrChange?.('');
    changeOperateState?.(EOperateState.TEXT_REST);
  };

  const handleSendMsg = () => {
    setQuestionStr('');
    handleSend(questionStr);
    setIsNeedFocus(false);
  };

  const handleFocus = () => {
    changeOperateState?.(EOperateState.TEXT_ENTER);
    setIsNeedFocus(true);
  }

  useEffect(() => {
    if (externalQuestionStr) {
      (inputRef.current as any)?.focus();
      changeOperateState?.(EOperateState.TEXT_ENTER);
      setQuestionStr(externalQuestionStr);
    }
  }, [externalQuestionUUID, externalQuestionStr]);

  return (
    <View className="input-enter">
      {questionStr?.trim() && <View className="close-btn" onClick={handleClose} />}
      <View className="input-container">
        <Input
          placeholder="在这里输入你的问题~"
          focus={isNeedFocus}
          maxlength={500}
          type="text"
          onFocus={handleFocus}
          value={questionStr}
          onInput={handleInput}
        />
        {microAppUuid && isBeautySummaryScenes && (
          <View className="upload_img">
            <ImageUpload />
          </View>
        )}
      </View>
      {questionStr?.trim() !== '' ? (
        <View className="send-btn" onClick={handleSendMsg} />
      ) : (
        <View className="voice-btn" onClick={() => changeOperateState?.(EOperateState.VOICE_REST)} />
      )}
    </View>
  );
};

export default InputEnter;
