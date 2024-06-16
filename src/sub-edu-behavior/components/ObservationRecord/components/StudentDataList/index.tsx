import React, { useState, useMemo } from 'react';
import { View, ScrollView, Image, Text } from '@tarojs/components';
// import { useRequest } from 'ahooks';

import 'taro-ui/dist/style/components/tab-bar.scss';
import 'taro-ui/dist/style/components/badge.scss';
import type { IGetBehaviorStuDataDetailRes } from '../../../../request/type';
// import { getSectorListApi } from '../../../../request';

import './index.less';

export interface IstudentDataListProps {
  dataList: IGetBehaviorStuDataDetailRes[];
  visilbleNum: string;
  chooseLnum: (index: number, index2: number) => void;
}

const StudentDataList: React.FC<IstudentDataListProps> = ({ dataList = [], chooseLnum, visilbleNum }) => {
  const [chooseNum, setChooseNum] = useState(0);
  // const { data: settorList = [] } = useRequest(() => getSectorListApi({}));
  // console.log('settorList', settorList);

  const detail: any[] = useMemo(() => {
    return dataList[chooseNum]?.sectorList || {};
  }, [chooseNum, dataList]);

  return (
    <View className="student-data">
      {dataList?.length ? (
        <>
          <ScrollView scrollX className="student-data-list" enableFlex>
            {/* <View className="student-data-list-view"> */}
            {dataList.map((item, index) => {
              return (
                <View
                  onClick={() => setChooseNum(index)}
                  className={`student-data-list-item ${chooseNum === index ? 'student-data-list-active' : ''}`}
                  key={item?.studentId || index}
                >
                  {item?.studentName}
                </View>
              );
            })}
            {/* </View> */}
          </ScrollView>
          <View className="student-data-detail">
            {detail?.length
              ? detail.map((item: any, index: number) => {
                return (
                  <View className="detail-flex" key={index}>
                    <Image className="detail-flex-left" src="https://senior.cos.clife.cn/xiao-c/xiaoc-3.png" />
                    <View className="detail-flex-right">
                      <View key={index} className="mb24">
                        <View className="detail-flex-right-title">
                          {item?.area}-{item?.sub}
                        </View>
                        {item?.chosen?.length
                          ? item?.chosen.map((item2: any, index2: number) => {
                            return (
                              <View key={index2} className="detail-chosen mt24">
                                <View className="detail-chosen-left">{item2?.title}</View>
                                <View
                                  className="detail-chosen-right"
                                  onClick={(e: any) => {
                                    e.stopPropagation();
                                    chooseLnum(index, index2);
                                  }}
                                >
                                  <Text>{item2?.level}</Text>
                                  {visilbleNum === `${index}-${index2}` ? (
                                    <View className="detail-chosen-right-tip">{item2?.level_standard}</View>
                                  ) : null}
                                </View>
                              </View>
                            );
                          })
                          : null}
                      </View>
                    </View>
                  </View>
                );
              })
              : null}
          </View>
        </>
      ) : null}
    </View>
  );
};

export default StudentDataList;
