/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useMemo } from 'react';
import type { FC } from 'react';
import { View } from '@tarojs/components';
import { AtAvatar, AtButton, AtFloatLayout } from 'taro-ui';
import type { ChildProps } from '@edu/components/archive';
import { getResource } from '@edu/request';
import classNames from 'classnames';
import Taro from '@tarojs/taro';

import './index.less';
import ModuleTitle from '../module-title';
import { DEFAULT_AVATAR_BOY, DEFAULT_AVATAR_GIRL } from '@plugin/constants';

/** 观察幼儿 */
export const ObserveChild: FC<ChildProps> = ({ state, dispatch, type = 'notable' }) => {
  const { childModal, gradeList, selectStudent, allStudents } = state || {};
  const [selectClass, setSelectClass] = useState<number>();
  const [selectChild, setSelectChild] = useState<number[]>([]);

  const classOptions = useMemo(() => gradeList?.map(({ classList }) => classList)?.flat(2) || [], [gradeList]);
  const { studentOptions, allStudentOptions } = useMemo(() => {
    const studentOptions = classOptions?.find(({ classId }) => classId === selectClass)?.studentList;
    const allStudentOptions = classOptions?.map((item) => item?.studentList)?.flat(2);
    return { studentOptions, allStudentOptions };
  }, [classOptions, selectClass]);
  const selectStudents = useMemo(
    () => allStudentOptions?.filter((item) => selectChild?.includes(item?.studentId as number)),
    [allStudentOptions, selectChild],
  );

  useEffect(() => {
    getGradeList();
  }, []);
  useEffect(() => {
    if (childModal) {
      setSelectClass(gradeList?.[0]?.classList?.[0]?.classId);
      setSelectChild(selectStudent?.map((item) => item?.studentId as number) || []);
    } else {
      setSelectChild([]);
    }
  }, [childModal, gradeList, selectStudent]);
  const getGradeList = async () => {
    const { gradeList } = (await getResource()) || {};
    dispatch('gradeList', gradeList);
    setSelectClass(gradeList?.[0]?.classList?.[0]?.classId);
  };
  return (
    <>
      <View className="observe-child-container">
        <ModuleTitle
          title={type === 'observe' ? '观察幼儿' : '幼儿姓名'}
          required
          right={
            type === 'observe' ? (
              <AtButton className="add-btn" onClick={() => dispatch('childModal', true)}>
                <View className="at-icon at-icon-add" />
                添加
              </AtButton>
            ) : null
          }
        />
        <View className="child-list">
          {(type === 'notable' ? allStudents : selectStudent)?.map((student) => {
            const { studentId, studentName, avatar, sex } = student || {};
            const isChecked = selectStudent?.find((i) => i?.studentId === studentId);
            return (
              <View
                className={classNames('child-item', {
                  unchecked: !isChecked,
                })}
                key={studentId}
                onClick={() => {
                  if (type === 'observe' || isChecked) return;
                  let list = [...selectStudent];
                  list.push(student);
                  dispatch('selectStudent', list);
                }}
              >
                <AtAvatar circle image={avatar || (sex === 1 ? DEFAULT_AVATAR_BOY : DEFAULT_AVATAR_GIRL)} />
                <View className="child-name">{studentName || '--'}</View>
                {isChecked && (
                  <View className="close-btn">
                    <View
                      className="at-icon at-icon-close"
                      onClick={() => {
                        if (selectStudent?.length <= 1)
                          return Taro.showToast({
                            title: '最少选中一个幼儿',
                            icon: 'none',
                          });
                        const list = [...selectStudent];
                        list.splice(
                          list.findIndex(({ studentId: id }) => id === studentId),
                          1,
                        );
                        dispatch('selectStudent', list);
                      }}
                    />
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>
      {type === 'observe' && (
        <AtFloatLayout isOpened={childModal} className="child-modal" onClose={() => dispatch('childModal', false)}>
          <View className="child-modal-container">
            <View className="modal-header">
              <View className="cancel-btn" onClick={() => dispatch('childModal', false)}>
                取消
              </View>
              <View className="modal-title">添加幼儿</View>
            </View>
            <View className="modal-body">
              <View className="class-list">
                {classOptions?.map(({ classId, className }) => (
                  <View
                    className={classNames('class-item', { active: classId === selectClass })}
                    key={classId}
                    onClick={() => setSelectClass(classId)}
                  >
                    {className}
                  </View>
                ))}
              </View>

              <View className="student-list-wrap">
                <View className="student-list">
                  {studentOptions?.map(({ studentId, studentName, avatar, sex }) => {
                    const active = selectChild?.includes(studentId as number);
                    const defaultAvatar = sex === 1 ? DEFAULT_AVATAR_BOY : DEFAULT_AVATAR_GIRL;
                    return (
                      <View
                        className={classNames('student-item', { active })}
                        key={studentId}
                        onClick={() => {
                          const list = [...(selectChild || [])];
                          if (active) {
                            list.splice(list.indexOf(studentId as number), 1);
                          } else if (list.length < 10) {
                            list.push(studentId as number);
                          } else {
                            Taro.showToast({ title: '最多选择10个幼儿', icon: 'none' });
                          }
                          setSelectChild(list);
                        }}
                      >
                        <AtAvatar image={avatar || defaultAvatar} circle />
                        <View className="student-name">{studentName}</View>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>
            <View className="modal-footer-wrap">
              <AtButton
                type="primary"
                onClick={() => {
                  const newList = selectStudents?.map((i) => ({
                    ...i,
                    ...(selectStudent?.find(({ studentId }) => i?.studentId === studentId) || {}),
                  }));
                  dispatch('state', {
                    childModal: false,
                    selectStudent: newList,
                  });
                }}
              >
                确定({selectChild?.length || 0})
              </AtButton>
            </View>
          </View>
        </AtFloatLayout>
      )}
    </>
  );
};

export default ObserveChild;
