import React, { useState, useMemo, useEffect } from 'react';
import { useRequest } from 'ahooks';
import Taro, { useRouter } from '@tarojs/taro';
import { View, Image } from '@tarojs/components';
import { getResource } from '@edu/request';
import { DEFAULT_AVATAR_BOY, DEFAULT_AVATAR_GIRL } from '@plugin/constants';
import './index.less';

export interface IChooseChildRouter {
  selectedChildData: string;
}

const ChooseChild = () => {
  const router = useRouter<RouterParams<IChooseChildRouter>>();

  const { data } = useRequest(() => getResource());
  const classList = useMemo(() => {
    return data?.gradeList?.flatMap((item) => item.classList) || [];
  }, [data]);

  const [currentClassId, setCurrentClassId] = useState<number>();
  const [selectedChildren, setSelectChildren] = useState<number[]>([]);

  const handleAddChild = (id?: number) => {
    if (!id) return;
    if (selectedChildren.includes(id)) {
      setSelectChildren(selectedChildren.filter((childId) => childId !== id));
    } else {
      setSelectChildren([...selectedChildren, id]);
    }
  };

  const handleConfirm = () => {
    Taro.navigateBack({
      delta: 1,
      success: function () {
        Taro.eventCenter.trigger('selectedChildData', selectedChildren);
      },
    });
  };

  const handleReset = () => {
    setSelectChildren([]);
    Taro.navigateBack({
      delta: 1,
      success: function () {
        Taro.eventCenter.trigger('selectedChildData', []);
      },
    });
  };

  Taro.useDidShow(() => {
    const children = router.params.selectedChildData?.split(',')?.filter(Boolean).map(Number);
    !!children?.length && setSelectChildren(children);
  });

  useEffect(() => {
    if (classList.length) {
      setCurrentClassId(classList[0]?.classId);
    }
  }, [classList]);

  return (
    <View className="choose-child">
      <View className="container">
        <View className="class-list">
          {classList.map((i) => (
            <View
              className={`class-item ${currentClassId === i.classId ? 'active' : ''}`}
              onClick={() => setCurrentClassId(i.classId || 0)}
              key={i.classId}
            >
              {i.className}
            </View>
          ))}
        </View>
        <View className="child-list">
          {classList
            .find((i) => i.classId === currentClassId)
            ?.studentList?.map((child) => (
              <View
                className={`child ${selectedChildren.includes(child.studentId || 0) ? 'active' : ''}`}
                key={child.studentId}
                onClick={() => handleAddChild(child.studentId)}
              >
                <Image
                  src={child.avatar || (child.sex === 1 ? DEFAULT_AVATAR_BOY : DEFAULT_AVATAR_GIRL)}
                  className="avatar"
                />
                <View className="name">{child.studentName}</View>
              </View>
            ))}
        </View>
      </View>
      <View className="bottom">
        <View className="reset" onClick={handleReset}>
          重置
        </View>
        <View className="confirm" onClick={handleConfirm}>
          确定{selectedChildren.length ? `(${selectedChildren.length})` : ''}
        </View>
      </View>
    </View>
  );
};

export default ChooseChild;
