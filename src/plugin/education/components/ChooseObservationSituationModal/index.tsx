/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';

import { PageContainer, View, Text, Image, Button, RootPortal } from '@tarojs/components';
import './index.less';

import type { IObservationSituationInfo, SectorContent } from '../../request/type';

export interface IshowModalProps {
  show: boolean;
  handleClose: () => void;
  handleSelect: (item: any) => void;
  situationInfo?: IObservationSituationInfo;
  situationList?: IObservationSituationInfo[];
  dataList?: SectorContent[];
  type?: string;
}

const ChooseObservationSituationModal: React.FC<IshowModalProps> = ({
  show,
  situationInfo,
  situationList = [],
  handleClose,
  handleSelect,
  type = 'radio',
  dataList = [],
}) => {
  // const { data: dataList = [] } = useRequest(getSituationLabelList);
  const [selectInfo, setSelectInfo] = useState<IObservationSituationInfo>();
  const [selectList, setSelectList] = useState<IObservationSituationInfo[]>([]);

  useEffect(() => {
    if (show) {
      type === 'radio' ? setSelectInfo(situationInfo) : setSelectList(situationList || []);
    }
    return () => {
      handleClose();
    };
  }, []);

  const handleSelectList = (label: IObservationSituationInfo, isChecked: boolean) => {
    if (isChecked) {
      const index = selectList.findIndex((item: IObservationSituationInfo) => item.situationId === label.situationId);
      selectList.splice(index, 1);
      setSelectList([...selectList]);
    } else {
      setSelectList([...selectList, label]);
    }
  };

  return (
    <RootPortal>
      <PageContainer show={show} onClickOverlay={handleClose} zIndex={100} round={true}>
        <View className="observation-situation-modal">
          <View className="modal-title">
            <Text>选择观察情境</Text>
            <Image
              src="https://senior.cos.clife.cn/xiao-c/icon-close-tag-selecter.png"
              className="modal-title-close "
              onClick={handleClose}
            />
          </View>
          <View className="situation-label">
            {dataList.map((item: any) => {
              const { typeId, typeName, situationList } = item;
              return (
                <View className="situation-label-item" key={typeId}>
                  <View className="situation-label-title">{typeName}</View>
                  <View className="situation-label-list">
                    {situationList?.map((label: any) => {
                      const { situationName, situationId } = label;
                      const isChecked =
                        type === 'radio'
                          ? situationId === selectInfo?.situationId
                          : selectList.some((v) => v.situationId === situationId);
                      return type === 'radio' ? (
                        <View
                          className={isChecked ? 'situation-label-name checked' : 'situation-label-name'}
                          key={situationId}
                          onClick={() => setSelectInfo(label)}
                        >
                          {situationName}
                        </View>
                      ) : (
                        <View
                          className={isChecked ? 'situation-label-name multiple checked' : 'situation-label-name'}
                          key={situationId}
                          onClick={() => handleSelectList(label, isChecked)}
                        >
                          {situationName}
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </View>

          <View className="situation-btn">
            <Button className="footer-btn cancel-btn" onClick={handleClose}>
              取消
            </Button>
            {type === 'radio' ? (
              <Button
                className={!selectInfo?.situationId ? 'footer-btn confirm-btn disabled' : 'footer-btn confirm-btn'}
                disabled={!selectInfo?.situationId}
                onClick={() => handleSelect(selectInfo)}
              >
                确定
              </Button>
            ) : (
              <Button
                className={!selectList?.length ? 'footer-btn confirm-btn disabled' : 'footer-btn confirm-btn'}
                disabled={!selectList?.length}
                onClick={() => handleSelect(selectList)}
              >
                确定
              </Button>
            )}
          </View>
        </View>
      </PageContainer>
    </RootPortal>
  );
};

export default ChooseObservationSituationModal;
