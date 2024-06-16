import React, { useState, useMemo, useContext } from 'react';
import { View, Image } from '@tarojs/components';
import { UICardContext } from '@plugin/stores/UICardContext';
import { ECheckStatus } from '@plugin/components/ChatWrapper';
import { DEFAULT_AVATAR_BOY, DEFAULT_AVATAR_GIRL } from '@plugin/constants';
import './index.less';

export interface IDuplicateNameConfirmProps { }

interface IStudentInfo {
  studentId: number;
  studentName: string;
  sex: 1 | 2;
  avatar: string;
  birthday: string;
  classId: number;
}

const fixName = (name: string) => {
  const match = name.match(/请选择(.+?)：/);
  return match ? match[1] : "";
}

const DuplicateNameConfirm: React.FC<IDuplicateNameConfirmProps> = () => {
  const [selectedStudents, setSelectedStudents] = useState<IStudentInfo[]>([]);

  const { chatItem, isGlobalLastAnswer, putChat, chatList, globalCheckStatus } = useContext(UICardContext) || {};
  const disabledStatus = !isGlobalLastAnswer || globalCheckStatus === ECheckStatus.NEW_SESSION;

  const handleSelect = (student: IStudentInfo, askName: string) => {
    if (disabledStatus) return;
    // 根据已选择的幼儿的名称中是否包含提问的幼儿名称来确定同名幼儿被选中
    if (!selectedStudents.some((i) => i.studentName.includes(fixName(askName)))) {
      const filterOneList = list => list.filter(i => i.selectValue.length === 1);
      const flatMap = (list) => list.flatMap((item) => item.selectValue);
      const list = [...selectedStudents, student];
      setSelectedStudents(list);
      // 已经点击了所有的重名幼儿
      if (list.length === duplicateList.length) {
        putChat?.(
          {
            query: chatList?.[chatList.length - 2]?.chatContent, // 取第一次提问的 query
            param: {
              // 后端除了会返回重名的列表，不重名的也会返回，请求时需要带回去只有一个幼儿的信息
              student: [...list, ...flatMap(filterOneList(componentInParam))],
            },
            inParamFlag: true,
          },
          {
            needPutAnsker: false,
          },
        );
      }
    }
  };

  const componentInParam = useMemo(() => {
    if (Array.isArray(chatItem?.componentInParam)) {
      return chatItem.componentInParam;
    } else {
      return JSON.parse(chatItem?.componentInParam || '[]')
    }
    // 模拟数据
    // return [
    //   {
    //     prefix: '请选择梅凯：', selectValue: [
    //       { avatar: 'https://campus-test.cos.clife.cn/campus/077f0b8af9c6cf6d7326d96a32f4422b.jpg?imageView2/0/h/200', studentId: 1, studentName: '梅凯1' },
    //       { avatar: 'https://campus-test.cos.clife.cn/campus/077f0b8af9c6cf6d7326d96a32f4422b.jpg?imageView2/0/h/200', studentId: 2, studentName: '梅凯2' },
    //       { avatar: 'https://campus-test.cos.clife.cn/campus/077f0b8af9c6cf6d7326d96a32f4422b.jpg?imageView2/0/h/200', studentId: 3, studentName: '梅凯3' },
    //     ]
    //   },
    //   {
    //     prefix: '请选择麦克：', selectValue: [
    //       { avatar: 'https://campus-test.cos.clife.cn/campus/077f0b8af9c6cf6d7326d96a32f4422b.jpg?imageView2/0/h/200', studentId: 4, studentName: '麦克4' },
    //       { avatar: 'https://campus-test.cos.clife.cn/campus/077f0b8af9c6cf6d7326d96a32f4422b.jpg?imageView2/0/h/200', studentId: 5, studentName: '麦克5' },
    //     ]
    //   },
    //   {
    //     prefix: '请选择李四：', selectValue: [
    //       { avatar: 'https://campus-test.cos.clife.cn/campus/077f0b8af9c6cf6d7326d96a32f4422b.jpg?imageView2/0/h/200', studentId: 24, studentName: '是的5' },
    //     ]
    //   },
    //   {
    //     prefix: '请选择张三：', selectValue: [
    //       { avatar: 'https://campus-test.cos.clife.cn/campus/077f0b8af9c6cf6d7326d96a32f4422b.jpg?imageView2/0/h/200', studentId: 8, studentName: '张三8' },
    //     ]
    //   },
    // ]
  }, [chatItem]);

  const duplicateList = useMemo(() => {
    const filterMoreList = list => list.filter(i => i.selectValue.length > 1)
    return filterMoreList(componentInParam);
  }, [componentInParam]);

  const getAvatar = (student: IStudentInfo) => {
    if (student.avatar) return student.avatar;
    return student.sex === 1 ? DEFAULT_AVATAR_BOY : DEFAULT_AVATAR_GIRL;
  };

  const isNotActive = (selectedStudent: IStudentInfo, askName: string) => {
    return (
      (selectedStudents.some((i) => i.studentName.includes(fixName(askName))) &&
        !selectedStudents.map((i) => i.studentId).includes(selectedStudent.studentId)) ||
      disabledStatus
    );
  };

  return (
    <View className={`duplicate-name-confirm ${disabledStatus ? 'disabled' : ''}`}>
      {duplicateList.map((i) => (
        <View key={i} className="duplicate-item">
          <View className="title">{`${i.prefix}`}</View>
          <View className="child-info">
            {i.selectValue?.map((j) => (
              <View key={j.studentId} className="child" onClick={() => handleSelect(j, i.prefix)}>
                <Image
                  mode="aspectFill"
                  src={getAvatar(j)}
                  className={`
                    avatar
                    ${selectedStudents.map((i) => i.studentId).includes(j.studentId) ? 'active' : ''}
                    ${isNotActive(j, i.prefix) ? 'not-active' : ''}
                  `}
                />
                <View
                  className={`
                    name
                    ${isNotActive(j, i.prefix) ? 'not-active' : ''}
                  `}
                >
                  {j.studentName}
                </View>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
};

export default DuplicateNameConfirm;
