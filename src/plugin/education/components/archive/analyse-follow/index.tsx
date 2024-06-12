import React from 'react';
import type { FC } from 'react';
import { View } from '@tarojs/components';
import ModuleTitle from '@edu/components/archive/module-title';
import type { ChildProps } from '@edu/components';
import { AtTextarea } from 'taro-ui';
import './index.less';

const MAX_LENGTH = 5000;
const commonArr = {
  height: 276,
  maxLength: MAX_LENGTH,
  placeholder: '请输入',
};
/** 观察分析&跟进措施 */
export const AnalyseFollow: FC<ChildProps> = ({ dispatch, state }) => {
  const { observeAnalysis, observeFollow } = state || {};

  return (
    <View className="analyse-follow-container">
      {/* 观察分析 */}
      <View className="analyse-wrap">
        <ModuleTitle title="观察分析" />
        <AtTextarea
          onChange={(val) => dispatch('observeAnalysis', val.slice(0, MAX_LENGTH))}
          value={observeAnalysis}
          {...commonArr}
        />
      </View>
      {/* 跟进措施 */}
      <View className="follow-wrap">
        <ModuleTitle title="跟进措施" />
        <AtTextarea
          onChange={(val) => dispatch('observeFollow', val.slice(0, MAX_LENGTH))}
          value={observeFollow}
          {...commonArr}
        />
      </View>
    </View>
  );
};

/** 观察内容 */
export const ObserveContent: FC<ChildProps> = ({ dispatch, state }) => {
  const { observeContent } = state || {};
  return (
    <View className="observe-content-container">
      <View className="analyse-wrap">
        <ModuleTitle title="观察内容" required />
        <AtTextarea
          onChange={(val) => dispatch('observeContent', val.slice(0, MAX_LENGTH))}
          value={observeContent}
          {...commonArr}
        />
      </View>
    </View>
  );
};

export default AnalyseFollow;
