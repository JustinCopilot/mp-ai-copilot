import React, { useEffect, useState, useContext, useMemo } from 'react';
import { ChatWrapperContext } from '@plugin/stores/ChatWrapperContext';
import type { IChatItem } from '@plugin/components/ChatWrapper';
import { View } from '@tarojs/components';
import TagSelector from './TagSelector';
import Star from './Star';
import './index.less';

export const RatingMap = {
  低: 1,
  中: 3,
  高: 5,
};

export interface IBeautyAnswerSummaryProps {
  chatContent: IChatItem['chatContent'];
  summaryUserTags: IChatItem['summaryUserTags'];
  summaryUserSatisfaction: IChatItem['summaryUserSatisfaction'];
}

const BeautyAnswerSummary = ({
  chatContent,
  summaryUserTags = [],
  summaryUserSatisfaction = '',
}: IBeautyAnswerSummaryProps) => {
  const [rating, setRating] = useState(1);
  const [tags, setTags] = useState<string[]>([]);
  const [tagSelectorVisible, setTagSelectorVisible] = useState<boolean>(false);

  const {
    summaryCallbackData,
    changeSummaryCallbackData,
    chatList = [],
    changeSummaryUserTags,
    summaryUserTags: storedSummaryUserTags,
  } = useContext(ChatWrapperContext) || {};

  const handleConfirm = (editTags: string[]) => {
    const tags = editTags.map((tag) => tag.split('-')?.[1]);
    if (editTags?.length) {
      changeSummaryUserTags?.(editTags);
    }
    setTags(tags);
    setTagSelectorVisible(false);
  };

  const isShowEditEntry = useMemo(() => {
    return chatList[chatList?.length - 1]?.chatContent === chatContent;
  }, [chatList, chatContent]);

  // 用户满意度处理
  useEffect(() => {
    summaryUserSatisfaction && setRating(RatingMap[summaryUserSatisfaction]);
  }, [summaryUserSatisfaction]);

  // 用户标签处理
  useEffect(() => {
    let data = storedSummaryUserTags?.length ? storedSummaryUserTags : summaryUserTags;
    setTags(data.map((tag) => tag.split('-')?.[1]).filter((i) => !!i));
  }, [summaryUserTags, storedSummaryUserTags]);

  // 处理回传给宿主的数据
  useEffect(() => {
    !!tags?.length &&
      changeSummaryCallbackData?.(
        Object.assign(summaryCallbackData, {
          tags,
        }),
      );
  }, [tags]);

  return (
    (!!summaryUserTags?.length || summaryUserSatisfaction) && (
      <View className="beauty-answer-summary">
        <View className="user-satisfaction">
          <View className="title">用户满意度</View>
          <Star rating={rating} />
        </View>
        <View className="user-tags">
          <View className="title">
            用户标签
            {isShowEditEntry && <View className="edit-icon" onClick={() => setTagSelectorVisible(true)} />}
          </View>
          <View className="tags">
            {tags.map((tag, index) => (
              <View key={index} className="tag">
                {tag}
              </View>
            ))}
          </View>
        </View>
        <TagSelector
          show={tagSelectorVisible}
          onCancel={() => setTagSelectorVisible(false)}
          onConfirm={(editTags) => handleConfirm(editTags)}
        />
      </View>
    )
  );
};

export default BeautyAnswerSummary;
