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
  const { microAppId, changeOperateState, questionStrChange } = useContext(ChatWrapperContext) || {};
  const { isBeautySummaryScenes } = useGetScenes(microAppId);

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
  };

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
          focus={true}
          maxlength={500}
          type="text"
          onFocus={() => changeOperateState?.(EOperateState.TEXT_ENTER)}
          value={questionStr}
          onInput={handleInput}
        />
        {microAppId && isBeautySummaryScenes && (
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
