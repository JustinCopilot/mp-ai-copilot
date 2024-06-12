import React, { useContext, useEffect, useState } from 'react';
import { Button, Image, PageContainer, Text, View, RootPortal } from '@tarojs/components';
import { ChatWrapperContext } from '@plugin/stores/ChatWrapperContext';
import { TagGroups, TagDict } from './data';
import './index.less';

interface ITagSelecterProps {
  show: boolean;
  onCancel: () => void;
  onConfirm: (tags: Array<string>) => void;
}

const TagSelector: React.FC<ITagSelecterProps> = ({ show, onCancel, onConfirm }) => {
  const [selectedTags, setSelectedTags] = useState({});
  const [tagGroups, setTagGroups] = useState(TagGroups);

  const { chatList, summaryUserTags } = useContext(ChatWrapperContext) || {};

  const handleClose = () => {
    handleInit();
    onCancel();
  };
  const handleSelectTag = (groupTitle, tagName) => {
    setSelectedTags((preTags) => {
      let tempTags = { ...preTags };
      tempTags[`${groupTitle}-${tagName}`] = !tempTags[`${groupTitle}-${tagName}`];
      return tempTags;
    });
  };

  const handleInit = () => {
    let tempTags = {};
    // 优先获取全局缓存的标签数据，因为可能是编辑过的。没有再获取智能体返回的
    const data = summaryUserTags?.length ? summaryUserTags : chatList?.[chatList.length - 1]?.summaryUserTags;
    const otherTags: string[] = [];
    data?.forEach((tag) => {
      const [tagType, tagValue] = tag.split('-');
      // 如果智能体返回了不存在的标签
      if (!TagDict[tagType]?.includes(tagValue)) {
        if (tagValue) {
          otherTags.push(tagValue);
          tempTags[`其他-${tagValue}`] = true;
        }
      }
      setTagGroups([
        ...TagGroups,
        {
          title: '其他',
          tags: otherTags,
        },
      ]);
      tempTags[tag] = true;
    });
    setSelectedTags(tempTags);
  };

  const handleOk = () => {
    let comfirmTags: Array<string> = [];
    tagGroups.forEach((group) => {
      group.tags.forEach((tag) => {
        if (selectedTags[`${group.title}-${tag}`]) comfirmTags.push(`${group.title}-${tag}`);
      });
    });
    onConfirm(comfirmTags);
  };

  useEffect(() => {
    handleInit();
  }, []);

  return (
    show && (
      <RootPortal>
        <PageContainer show={show} onClickOverlay={handleClose} zIndex={100} round={true}>
          <View className="tag-selecter">
            <View className="header">
              <Text className="title">编辑用户标签</Text>
              <View className="close" onClick={handleClose}>
                <Image className="icon-close" src="https://senior.cos.clife.cn/xiao-c/icon-close-tag-selecter.png" />
              </View>
            </View>
            <View className="groups">
              {tagGroups.map((group, index) => {
                return (
                  <View className="tag-group" key={index}>
                    <View className="title">{group.title}</View>
                    <View className="tags">
                      {group.tags.map((tag, tagIndex) => {
                        let isSelect = selectedTags[`${group.title}-${tag}`];
                        return (
                          <View
                            className={`tag${isSelect ? ' selected' : ''}`}
                            key={index + '-' + tagIndex}
                            onClick={() => {
                              handleSelectTag(group.title, tag);
                            }}
                          >
                            {tag}
                          </View>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
            </View>
            <View className="buttom-area">
              <Button className="buttom-area-btn reset" onClick={handleInit}>
                重置
              </Button>
              <Button className="buttom-area-btn ok" onClick={handleOk}>
                确定
              </Button>
            </View>
          </View>
        </PageContainer>
      </RootPortal>
    )
  );
};

export default TagSelector;
