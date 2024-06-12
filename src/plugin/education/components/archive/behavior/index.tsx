/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, FC, useMemo, useState } from 'react';
import { Button, Image, Text, View } from '@tarojs/components';
import {
  AtButton,
  AtActionSheet,
  AtActionSheetItem,
  AtModal,
  AtModalHeader,
  AtModalContent,
  AtModalAction,
} from 'taro-ui';
import pick from 'lodash/pick';
import './index.less';
import { ChildProps } from '../config';
import ModuleTitle from '../module-title';
import SelectChildPicer from './SelectChildPicer';
import SelectBehavior from './selectBehaviorPicker';

const femaleDefaultAvatar = 'https://senior.cos.clife.cn/xiao-c/avatar-default.png';
const maleDefaultAvatar = 'https://senior.cos.clife.cn/xiao-c/default-head.png';
const medalImg = 'https://senior.cos.clife.cn/xiao-c/xiaoc-3.png';
export const Behavior: FC<ChildProps> = (props) => {
  const { state, dispatch } = props;
  const { selectStudent, childModal2, delEditModal, delModal, currentBehavior, currentStudent, currentSector } =
    state || {};
  // const list = [
  //   {
  //     birthday: '2014-01-01',
  //     studentId: 17871017738241,
  //     observeId: 858,
  //     sex: 1,
  //     studentName: '李昕怡',
  //     className: '洋浦KB1',
  //     age: '10岁5个月',
  //     data: [
  //       {
  //         typeId: 1,
  //         typeName: '健康与体能',
  //         data: [
  //           {
  //             value: 1,
  //             label: '身心状况',
  //             data: [
  //               { value: 1, label: '具有健康的体态', level: 1 },
  //               { value: 2, label: '情绪安定愉快', level: 2 },
  //             ],
  //           },
  //           { value: 2, label: '动作发展', data: [{ value: 4, label: '对运动感兴趣', level: 4 }] },
  //         ],
  //       },
  //       {
  //         typeId: 2,
  //         typeName: '习惯与自理',
  //         data: [{ value: 4, label: '学习习惯', data: [{ value: 11, label: '爱提问题', level: 5 }] }],
  //       },
  //     ],
  //   },
  // ];
  const newList = useMemo(() => {
    return selectStudent?.map((i) => ({
      ...i,
      data: i?.data?.reduce((p, c) => {
        const { data, typeId, typeName } = c || {};
        data?.forEach((item) => {
          const key = `key${typeName}-${item?.label}`;
          const title = `${typeName}-${item?.label}`;
          if (!p?.find((subI) => subI?.key === key)) {
            p.push({
              key,
              title,
              data: item?.data,
            });
          } else {
            p = p?.map(({ data, ...rest }) => ({
              ...rest,
              data: [...(data || []), ...(item?.data || [])],
            }));
          }
        });
        return p;
      }, []),
    }));
  }, [selectStudent]);

  useEffect(() => {
    const studentList = newList?.map(({ studentId, data }) => {
      const ids = data?.reduce((p, c) => {
        const { data } = c || {};
        data?.forEach(({ value }) => {
          if (!p?.includes(value)) p.push(value);
        });
        return p;
      }, []);
      const names = data?.reduce((p, c) => {
        const { data } = c || {};
        data?.forEach(({ label, level }) => {
          const key = `${label}-L${level}`;
          if (!p?.includes(key)) p.push(key);
        });
        return p;
      }, []);

      const behaviorId = [...new Set(ids || [])]?.join(',');
      const behaviorName = [...new Set(names || [])]?.join('/');
      return {
        studentId,
        behaviorId,
        behaviorName,
      };
    });
    console.log('🚀🚀🚀🚀🚀🚀  studentList:', studentList);
    dispatch('studentList', studentList);
  }, [newList]);

  const handleAction = (record, record1, record2) => {
    const { title } = record1 || {};
    const val = title?.split('-');
    dispatch('state', {
      delEditModal: true,
      currentStudent: pick(record, ['studentId', 'studentName', 'avatar', 'sex']),
      cSector: { label: val?.[0] },
      cBehavior: { parentLabel: val?.[1], title: record2?.label },
      cBehaviorLevel: { level: record2?.level },
    });
  };
  const onDelete = () => {
    const newList = selectStudent?.map((item) => {
      const { studentId, data } = item || {};
      if (studentId !== currentStudent?.studentId) return item;
      return {
        ...item,
        data: data?.map((subI) => {
          if (subI?.typeName !== currentSector?.label) return subI;
          return {
            ...subI,
            data: subI?.data?.map((subII) => {
              const list = subII?.data?.filter((subIII) => subIII?.label !== currentBehavior?.title);
              return {
                ...subII,
                data: list,
              };
            }),
          };
        }),
      };
    });
    dispatch('state', {
      delModal: false,
      delEditModal: false,
      selectStudent: newList,
      currentStudent: undefined,
      cSector: undefined,
      cBehavior: undefined,
      cBehaviorLevel: undefined,
    });
  };
  const hasValue = newList?.some((i) => i?.data?.length && i?.data?.some((subI) => subI?.data?.length));
  return (
    <View className="behavior-container">
      <ModuleTitle
        title="表现行为"
        right={
          <AtButton className="add-btn" onClick={() => dispatch('childModal2', true)}>
            <View className="at-icon at-icon-add" />
            添加
          </AtButton>
        }
      />
      {hasValue && (
        <View className="behavior-students">
          {newList?.map((item) => {
            const { studentName, studentId, avatar, sex, data } = item || {};
            if (!data?.length || !data?.some((i) => i?.data?.length)) return null;
            return (
              <View className="behavior-student-item" key={studentId}>
                <View className="student-base-info">
                  <Image src={avatar || (sex === 1 ? maleDefaultAvatar : femaleDefaultAvatar)} />
                  <Text className="info-name">{studentName || '--'}</Text>
                </View>
                <View className="behavior-info-list">
                  {data?.map((subItem) => {
                    const { key, title, data: subData } = subItem || {};
                    if (!subData?.length) return null;
                    return (
                      <View className="behavior-info-item" key={key}>
                        <View className="info-item-title">
                          <Image src={medalImg} />
                          <Text className="title-text">{title}</Text>
                        </View>
                        <View className="sub-list">
                          {subData?.map((subSubItem) => {
                            const { value, label, level } = subSubItem || {};
                            return (
                              <View
                                className="sub-item"
                                key={value}
                                onClick={() => handleAction(item, subItem, subSubItem)}
                              >
                                <Text className="sub-item-text">{label}</Text>
                                <View className="sub-item-right">
                                  <View className="level">L{level}</View>
                                  <View className="at-icon at-icon-chevron-right" />
                                </View>
                              </View>
                            );
                          })}
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>
      )}
      <SelectChildPicer
        studentList={selectStudent}
        show={childModal2}
        onClose={() => dispatch('childModal2', false)}
        onChange={(_, row) => dispatch('state', { currentStudent: row, behaviorModal: true })}
      />
      <SelectBehavior {...props} />
      <AtActionSheet
        isOpened={delEditModal}
        onClose={() => dispatch('state', { delEditModal: false })}
        cancelText="取消"
      >
        <AtActionSheetItem
          onClick={() => {
            dispatch('state', {
              delEditModal: false,
              behaviorModal: true,
              isEdit: true,
            });
          }}
        >
          编辑
        </AtActionSheetItem>
        <AtActionSheetItem onClick={() => dispatch('state', { delEditModal: false, delModal: true })}>
          删除
        </AtActionSheetItem>
      </AtActionSheet>

      <AtModal isOpened={delModal}>
        <AtModalHeader>删除</AtModalHeader>
        <AtModalContent>确定删除该表现行为评价吗？</AtModalContent>
        <AtModalAction>
          <Button>取消</Button> <Button onClick={onDelete}>确定</Button>
        </AtModalAction>
      </AtModal>
    </View>
  );
};

export default Behavior;
