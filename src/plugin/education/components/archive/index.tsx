import React, { useEffect, useMemo, useState } from 'react';
import type { FC } from 'react';
import { AtButton } from 'taro-ui';
import 'taro-ui/dist/style/components/button.scss';
import 'taro-ui/dist/style/components/icon.scss';
import 'taro-ui/dist/style/components/avatar.scss';
import 'taro-ui/dist/style/components/float-layout.scss';
import 'taro-ui/dist/style/components/textarea.scss';
import 'taro-ui/dist/style/components/action-sheet.scss';
import { View } from '@tarojs/components';
import { useReducer } from '@plugin/education/utils';
import pick from 'lodash/pick';
import omit from 'lodash/omit';
import Taro from '@tarojs/taro';
import AlertModal from '@plugin/components/AlertModal';
import type { Props, State } from './config';
import './index.less';
import ObserveChild from './observe-child';
import { ObserveTime, ParentVisible } from './observe-time';
import { AnalyseFollow, ObserveContent } from './analyse-follow';
import AnalysePhoto from './analyse-photo';
import ObserveSituation from './observe-situation';
import DomainLinked from './domain-linked';
import Behavior from './behavior';

export * from './config';

const initialState: State = {
  gradeList: [],
  childModal: false,
  childModal2: false,
  behaviorModal: false,
  behaviorModal2: false,
  selectClass: undefined,
  selectStudent: [],
  allStudents: [],
  observeTime: '',
  showParentVisible: false,
  parentVisible: false,
  observeAnalysis: '',
  observeFollow: '',
  observeContent: '',
  observePhoto: {},
  observeOptions: [],
  observeSituation: [],
  sectorOptions: [],
  sectorValue: [],
  currentStudent: undefined,
  currentBehavior: undefined,
  currentBehaviorLevel: undefined,
  currentSector: undefined,
  situationList: [],
  sectorList: [],
  studentList: [],
  delEditModal: false,
  delModal: false,
};
export const Archive: FC<Props> = (props) => {
  const { submit, type, isEdit = false } = props;
  const [state, dispatch] = useReducer<State>(initialState);
  const [isOpened, setIsOpened] = useState(false);
  const { observeContent, observeAnalysis, observeFollow } = state || {};

  const componentList = useMemo(() => {
    return type === 'observe'
      ? [
          // 观察幼儿
          ObserveChild,
          // 观察情境
          ObserveSituation,
          // 观察时间
          ObserveTime,
          // 关联领域
          DomainLinked,
          // 家长可见
          ParentVisible,
          // 观察内容
          ObserveContent,
          // 观察照片
          AnalysePhoto,
          // 表现行为
          Behavior,
          // 观察分析&跟进措施
          AnalyseFollow,
        ]
      : [
          // 观察幼儿
          ObserveChild,
          // 观察情境
          ObserveSituation,
          // 观察时间
          ObserveTime,
          // 关联领域
          DomainLinked,
          // 观察内容
          ObserveContent,
          // 观察照片
          AnalysePhoto,
        ];
  }, [type]);

  useEffect(() => {
    dispatch('state', { ...omit(props, ['submit', 'type']), allStudents: props?.selectStudent });
  }, [props]);
  return (
    <View className="archve-container">
      {componentList.map((Component, key) => (
        <Component {...{ state, dispatch, ...props }} key={key} />
      ))}

      <View className="footer-wrap">
        <AtButton className="cancel" onClick={() => setIsOpened(true)}>
          取消
        </AtButton>
        <AtButton
          type="primary"
          onClick={() => {
            Taro.hideToast();
            if (observeContent?.length <= 0) return Taro.showToast({ title: '观察内容不可为空', icon: 'none' });
            if (observeContent?.length > 5000) return Taro.showToast({ title: '观察内容不能超过5000字', icon: 'none' });
            if (observeAnalysis?.length > 5000)
              return Taro.showToast({ title: '观察分析不能超过5000字', icon: 'none' });
            if (observeFollow?.length > 5000) return Taro.showToast({ title: '跟进措施不能超过5000字', icon: 'none' });
            submit?.(
              pick(state, [
                'studentList',
                'selectStudent',
                'observeTime',
                'parentVisible',
                'observeAnalysis',
                'observeFollow',
                'observeContent',
                'observePhoto',
                'observeSituation',
                'sectorValue',
                'situationList',
                'sectorList',
              ]),
            );
            Taro.eventCenter.trigger('detailEditSave', type === 'observe' ? 1 : 2);
          }}
        >
          {isEdit ? '保存' : '确认归档'}
        </AtButton>
      </View>
      <AlertModal
        isOpened={isOpened}
        closeHandle={() => setIsOpened(false)}
        okHandle={() => {
          Taro.navigateBack();
        }}
        title="确认要退出编辑？"
        content="退出后编辑的内容将不会保存，确定要退出编辑吗？"
        cancelText="继续编辑"
        okText="退出"
      />
    </View>
  );
};

export default Archive;
