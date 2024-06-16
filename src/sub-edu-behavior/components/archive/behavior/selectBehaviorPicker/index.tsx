/* eslint-disable max-nested-callbacks */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useEffect, useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import 'taro-ui/dist/style/components/float-layout.scss';
import { AtButton, AtFloatLayout } from 'taro-ui';
import classNames from 'classnames';
import { ChildProps } from '@sub-edu-behavior/components/archive';
import Taro from '@tarojs/taro';
import cloneDeep from 'lodash/cloneDeep';
import './index.less';

export * from './config';

export const SelectBehavior: FC<ChildProps> = ({ dispatch, state }) => {
  const {
    behaviorModal,
    currentStudent,
    sectorOptions,
    currentSector,
    currentBehavior,
    currentBehaviorLevel,
    behaviorModal2,
    selectStudent,
    cSector,
    cBehavior,
    cBehaviorLevel,
  } = state || {};
  const title = useMemo(() => `选择${currentStudent?.studentName || '学生'}的表现行为`, [currentStudent]);

  const sectorList = useMemo(() => currentSector?.children, [currentSector]);
  const contentList = useMemo(() => currentBehavior?.contentList || [], [currentBehavior]);
  const desc = useMemo(
    () => `${currentSector?.label || ''}-${currentBehavior?.parentLabel || ''}-${currentBehavior?.title || ''}`,
    [currentSector, currentBehavior],
  );

  useEffect(() => {
    if (behaviorModal) {
      if (!cSector) {
        dispatch('currentSector', sectorOptions?.[0]);
      } else {
        const sector = { ...(sectorOptions?.find((i) => i?.label === cSector?.label) || {}) };
        const behavior =
          sector?.children
            ?.find((i) => i?.label === cBehavior?.parentLabel)
            ?.behaviorList?.find((i) => i?.title === cBehavior?.title) || {};
        dispatch('state', { currentSector: sector, currentBehavior: { ...behavior, ...cBehavior } });
      }
    } else {
      dispatch('state', { currentSector: undefined, currentBehavior: undefined });
    }
  }, [sectorOptions, behaviorModal]);

  const onSubmit = () => {
    if (!currentBehaviorLevel?.level) return Taro.showToast({ title: '请选择表现行为', icon: 'none' });
    let students = cloneDeep(selectStudent);
    students =
      students?.map((item) => {
        const { studentId, data } = item || {};
        if (studentId !== currentStudent?.studentId) return item;
        const isHav = data?.find(({ typeName }) => typeName === currentSector?.label);
        const uData = data?.map((i) => {
          if (i?.typeName !== cSector?.label && i?.typeName !== currentSector?.label) return i;
          return {
            ...i,
            data: i?.data?.filter((sub) => sub?.label !== cBehavior?.parentLabel),
          };
        });
        if (isHav) {
          uData?.map((i) => {
            if (i?.typeName !== currentSector?.label) return i;
            return {
              ...i,
              data: [
                ...(i?.data || []),
                {
                  value: currentBehavior?.behaviorId,
                  label: currentBehavior?.title,
                  level: currentBehaviorLevel?.level,
                },
              ],
            };
          });
        } else {
          uData?.push({
            typeName: currentSector?.label,
            data: [
              {
                value: currentBehavior?.parentValue,
                label: currentBehavior?.parentLabel,
                data: [
                  {
                    value: currentBehavior?.behaviorId,
                    label: currentBehavior?.title,
                    level: currentBehaviorLevel?.level,
                  },
                ],
              },
            ],
          });
        }
        return {
          ...item,
          data: data?.length
            ? cSector && cSector?.label !== currentSector?.label
              ? uData
              : isHav
                ? data?.map((subI) => {
                  if (subI?.typeName !== currentSector?.label) return subI;
                  const isHave = subI?.data?.find(({ label }) => label === currentBehavior?.parentLabel);
                  const updateData = subI?.data?.map((i) => {
                    if (i?.label !== cBehavior?.parentLabel) return i;
                    return {
                      ...i,
                      data: [
                        {
                          value: currentBehavior?.behaviorId,
                          label: currentBehavior?.title,
                          level: currentBehaviorLevel?.level,
                        },
                      ],
                    };
                  });
                  return {
                    ...subI,
                    typeId: currentSector?.value,
                    typeName: currentSector?.label,
                    data: cBehavior
                      ? updateData
                      : isHave
                        ? subI?.data?.map((subII) => {
                          if (subII?.label !== currentBehavior?.parentLabel) return subII;
                          const isHave2 = subII?.data?.find(({ label }) => label === currentBehavior?.title);
                          return {
                            ...subII,
                            value: currentBehavior?.parentValue,
                            label: currentBehavior?.parentLabel,
                            data: isHave2
                              ? subII?.data?.map((subIII) => {
                                if (subIII?.label !== currentBehavior?.title) return subIII;
                                return {
                                  ...subIII,
                                  value: currentBehavior?.behaviorId,
                                  label: currentBehavior?.title,
                                  level: currentBehaviorLevel?.level,
                                };
                              })
                              : [
                                ...subII?.data,
                                {
                                  value: currentBehavior?.behaviorId,
                                  label: currentBehavior?.title,
                                  level: currentBehaviorLevel?.level,
                                },
                              ],
                          };
                        })
                        : [
                          ...subI?.data,
                          {
                            value: currentBehavior?.parentValue,
                            label: currentBehavior?.parentLabel,
                            data: [
                              {
                                value: currentBehavior?.behaviorId,
                                label: currentBehavior?.title,
                                level: currentBehaviorLevel?.level,
                              },
                            ],
                          },
                        ],
                  };
                })
                : [
                  ...data,
                  {
                    typeId: currentSector?.value,
                    typeName: currentSector?.label,
                    data: [
                      {
                        value: currentBehavior?.parentValue,
                        label: currentBehavior?.parentLabel,
                        data: [
                          {
                            value: currentBehavior?.behaviorId,
                            label: currentBehavior?.title,
                            level: currentBehaviorLevel?.level,
                          },
                        ],
                      },
                    ],
                  },
                ]
            : [
              {
                typeId: currentSector?.value,
                typeName: currentSector?.label,
                data: [
                  {
                    value: currentBehavior?.parentValue,
                    label: currentBehavior?.parentLabel,
                    data: [
                      {
                        value: currentBehavior?.behaviorId,
                        label: currentBehavior?.title,
                        level: currentBehaviorLevel?.level,
                      },
                    ],
                  },
                ],
              },
            ],
        };
      }) || [];
    dispatch('state', {
      selectStudent: students,
      childModal2: false,
      behaviorModal: false,
      behaviorModal2: false,
      currentStudent: undefined,
      currentSector: undefined,
      currentBehavior: undefined,
      currentBehaviorLevel: undefined,
      cSector: undefined,
      cBehavior: undefined,
      cBehaviorLevel: undefined,
      delEditModal: false,
    });
  };
  const onCloseBehaviorModal = () => {
    dispatch('state', {
      behaviorModal: false,
      currentSector: undefined,
      currentBehavior: undefined,
      currentBehaviorLevel: undefined,
    });
  };
  const onCloseBehaviorModal2 = () => {
    dispatch('state', {
      behaviorModal2: false,
      currentBehaviorLevel: undefined,
    });
  };
  return (
    <>
      <AtFloatLayout isOpened={behaviorModal} className="behavior-modal" onClose={onCloseBehaviorModal}>
        <View className="behavior-modal-container">
          <View className="modal-header">
            <View className="cancel-btn" onClick={onCloseBehaviorModal}>
              取消
            </View>
            <View className="modal-title">{title}</View>
          </View>
          <View className="modal-body">
            <View className="sector-list">
              {sectorOptions?.map((item) => {
                const { value, label } = item || {};
                return (
                  <View
                    className={classNames('sector-item', { active: label === currentSector?.label })}
                    key={value}
                    onClick={() =>
                      dispatch('state', {
                        currentSector: item,
                        currentBehavior: undefined,
                        currentBehaviorLevel: undefined,
                        cBehaviorLevel: undefined,
                      })
                    }
                  >
                    {label}
                  </View>
                );
              })}
            </View>

            <View className="behavior-list-wrap">
              <View className="behavior-lists">
                {sectorList?.map(({ value, label, behaviorList }) => {
                  return (
                    <View className={classNames('behavior-list-item')} key={value}>
                      <View className="behavior-name">{label}</View>
                      <View className="behavior-list">
                        {behaviorList?.map((item) => {
                          const { behaviorId, title } = item || {};
                          const active = currentBehavior?.title === title;
                          return (
                            <View
                              className={classNames('behavior-item', { active })}
                              key={behaviorId}
                              onClick={() => {
                                dispatch('state', {
                                  currentBehavior: { ...item, parentLabel: label, parentValue: value },
                                  currentBehaviorLevel: undefined,
                                  cBehaviorLevel: undefined,
                                });
                              }}
                            >
                              {title}
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
          <View className="modal-footer-wrap">
            <AtButton onClick={() => dispatch('behaviorModal', false)} className="pre">
              上一步
            </AtButton>
            <AtButton type="primary" onClick={() => dispatch('behaviorModal2', true)}>
              下一步
            </AtButton>
          </View>
        </View>
      </AtFloatLayout>
      <AtFloatLayout isOpened={behaviorModal2} className="behavior-modal" onClose={onCloseBehaviorModal2}>
        <View className="behavior-modal-container">
          <View className="modal-header">
            <View className="cancel-btn" onClick={onCloseBehaviorModal2}>
              取消
            </View>
            <View className="modal-title">{title}</View>
          </View>
          <View className="modal-body2">
            <View className="modal-desc">{desc}</View>
            <View className="behavior-list2">
              {contentList?.map((record, index: number) => {
                const { contentId, level, content } = record || {};
                const active = currentBehaviorLevel?.level === level || cBehaviorLevel?.level === level;
                return (
                  <View
                    className={classNames('list2-item', { active })}
                    key={contentId}
                    onClick={() => dispatch('state', { currentBehaviorLevel: record, cBehaviorLevel: undefined })}
                  >
                    <View className="content-title">
                      L{level}-表现行为{index + 1}
                    </View>
                    <Text className="content-text">{content}</Text>
                  </View>
                );
              })}
            </View>
          </View>
          <View className="modal-footer-wrap">
            <AtButton onClick={() => dispatch('behaviorModal2', false)} className="pre">
              上一步
            </AtButton>
            <AtButton type="primary" onClick={onSubmit}>
              提交
            </AtButton>
          </View>
        </View>
      </AtFloatLayout>
    </>
  );
};

export default SelectBehavior;
