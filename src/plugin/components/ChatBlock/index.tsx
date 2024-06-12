import React from 'react';
import { View } from '@tarojs/components';
import './index.less';
import Asker from '../Asker';
import Answer from '../Answer';
import type { IChatItem } from '../ChatWrapper';

interface IChatBlockProps {
  chatItem: IChatItem;
}

const ChatBlock: React.FC<IChatBlockProps> = ({ chatItem }) => {
  return (
    <View className="chat_block">
      <Asker chatItem={chatItem} />
      <Answer chatItem={chatItem} />
    </View>
  );
};

export default ChatBlock;
