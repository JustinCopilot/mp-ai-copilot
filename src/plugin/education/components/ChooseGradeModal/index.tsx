import React, { useEffect } from 'react';
import { AtFloatLayout } from 'taro-ui';
import { View, RootPortal } from '@tarojs/components';
import './index.less';
import type { IObservationGradeInfo } from '../../request/type';

export interface IshowModalProps {
  show: boolean;
  handleClose: () => void;
  handleSelect: (item: IObservationGradeInfo) => void;
}

export const ChooseGradeModal: React.FC<IshowModalProps> = ({ show, handleClose, handleSelect }) => {
  const gradeList = [
    { gradeName: '托班', gradeId: 5 },
    { gradeName: '小班', gradeId: 6 },
    { gradeName: '中班', gradeId: 7 },
    { gradeName: '大班', gradeId: 8 },
    { gradeName: '混龄班', gradeId: 9 },
  ];
  useEffect(() => {
    return () => {
      handleClose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <RootPortal>
      <AtFloatLayout isOpened={show} className="points-behavior-modal" onClose={handleClose}>
        <View className="grade-modal">
          <View className="grade-modal-list">
            {gradeList.map((item: IObservationGradeInfo) => {
              const { gradeName, gradeId } = item;
              return (
                <View key={gradeId} className="grade-item" onClick={() => handleSelect(item)}>
                  {gradeName}
                </View>
              );
            })}
          </View>
          <View className="grade-modal-btn" onClick={handleClose}>
            取消
          </View>
        </View>
      </AtFloatLayout>
    </RootPortal>
  );
};

export default ChooseGradeModal;
