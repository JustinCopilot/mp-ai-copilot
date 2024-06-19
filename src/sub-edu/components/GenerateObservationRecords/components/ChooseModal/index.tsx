/* eslint-disable complexity */
/* eslint-disable max-lines */
/* eslint-disable no-nested-ternary */
import React, { useMemo } from 'react';
import dayjs from 'dayjs';

import Taro from '@tarojs/taro';
import { View, Swiper, SwiperItem, Text, Image, RootPortal, ScrollView, PageContainer } from '@tarojs/components';

import type { IObserveListRes, IStudentListRes } from '../../../../request/type';

import './index.less';

export interface IshowModalProps {
  show: boolean; // 是否隐藏
  step?: number; // 第几步骤，可以不传, 不传默认一个页面
  firstText?: string; // 第一步的确定按钮文字
  secondText?: string; // 第二步的确定按钮文字
  showCancel?: boolean; // 是否显示取消按钮
  changeVisible: (visible: boolean) => void; // 控制弹窗显示隐藏
  firstClick: () => void; // swiper第一个item的方法
  firstStepChooseData: IObserveListRes[]; // 第一步的选中数据
  secondClick?: (record: IStudentListRes) => void; // swiper第二个item的方法
  secondStepChooseData?: IStudentListRes[]; // 第二步的选中数据
  swiperChooseStep?: (num: number) => void; // swiper切换步骤方法
  dataList: any[]; // 第一步要渲染的数据
  chooseItem: (record: IObserveListRes, source?: number) => void; // 第一步选择
  goDetail: (record: IObserveListRes) => void; // 查看详情
  submit?: () => void; // 提交
  // getDataList: () => void; // 获取数据列表
  firstStepTotalRows: number; // 第一步的总条数
  showRecordList?: boolean;
  onTabsChange?: (index: number) => void;
  tabsIndex?: number;
  filterObserveList?: () => void;
  resourceList?: any[];
  chooseResourceList?: any[];
  chooseResourceNum?: number;
  onChangeResoureceNum: (record: any) => void;
  reset?: () => void;
  sureStudentListBtn?: () => void;
  thirdStepChooseData?: number[];
  copyThirdStepChooseData?: number[];
  chooseThirdStepData?: (val: number) => void;
  currentPageAddOne: () => void;
}
const ChooseModal: React.FC<IshowModalProps> = ({
  show,
  changeVisible,
  step = 0,
  firstText = '确定',
  secondText = '确定',
  firstClick,
  secondClick,
  secondStepChooseData = [],
  swiperChooseStep,
  showCancel = false,
  firstStepChooseData = [],
  dataList,
  chooseItem,
  goDetail,
  firstStepTotalRows,
  submit,
  showRecordList,
  onTabsChange,
  tabsIndex = 2,
  filterObserveList,
  resourceList,
  chooseResourceList = [],
  chooseResourceNum = 0,
  onChangeResoureceNum,
  reset,
  sureStudentListBtn,
  thirdStepChooseData = [],
  copyThirdStepChooseData = [],
  chooseThirdStepData,
  currentPageAddOne,
}) => {
  const fullYear = new Date().getFullYear();
  const childList: IStudentListRes[] = useMemo(() => {
    // 根据第一步选中的渲染第二步学生id
    const studentList = firstStepChooseData.map((item) => item.studentList).flat();
    const newList = studentList.reduce((t: any, v: any) => {
      return t.some((item: any) => item.studentId === v.studentId) ? t : [...t, v];
    }, []);
    return newList;
  }, [firstStepChooseData]);

  const firstChooseIds = useMemo(() => {
    // 第一步选中的observeId
    return firstStepChooseData.map((item) => item.observeId);
  }, [firstStepChooseData]);

  const secondChooseIds = useMemo(() => {
    // 第二部步选中的observeId
    return secondStepChooseData.map((item) => item.studentId);
  }, [secondStepChooseData]);

  const handleClose = () => {
    // 关闭弹窗
    changeVisible(false);
  };

  const changeStep = (val: number) => {
    // 跳转到指定步骤
    swiperChooseStep && swiperChooseStep(val);
  };

  const onScrollToLower = () => {
    // console.log('onScrollToLower 到底了');
    const flatArray = dataList?.map((item) => item?.observeList).flat();
    if (dataList?.length && flatArray?.length >= firstStepTotalRows) {
      Taro.showToast({
        title: '没有更多信息了',
        icon: 'none',
      });
      return;
    }
    currentPageAddOne();
    // getDataList();
  };

  // console.log(dataList, '---------------dataList------------>xxxxxxxxx');
  return (
    show && (
      <RootPortal>
        {/* <AtFloatLayout isOpened={show} className="points-behavior-modal jotDown-modal" onClose={handleClose}> */}
        <PageContainer show={show} onClickOverlay={handleClose} zIndex={100} round={true} onAfterLeave={handleClose}>
          <View className="modal">
            <View className="modal-title">
              {showRecordList && !!onTabsChange ? (
                (showRecordList && step !== 2) || (!showRecordList && step !== 1) ? (
                  <View className="modal-change">
                    <Text className={step === 0 ? 'swiper-tabs active' : 'swiper-tabs'} onClick={() => onTabsChange(2)}>
                      随手记
                    </Text>
                    <Text className={step === 1 ? 'swiper-tabs active' : 'swiper-tabs'} onClick={() => onTabsChange(1)}>
                      观察记录
                    </Text>
                  </View>
                ) : (
                  <Text>选择重点观察幼儿</Text>
                )
              ) : (
                <Text>{step === 0 ? '选择随手记' : step === 2 ? '选择观察情境' : '选择重点观察幼儿'}</Text>
              )}

              <Image
                src="https://senior.cos.clife.cn/xiao-c/icon-close-tag-selecter.png"
                className="modal-title-close "
                onClick={handleClose}
              />
            </View>
            <Swiper
              className="modal-body"
              current={step}
              onChange={(e) => {
                console.log('e', e);
                changeStep(e.detail.current);
              }}
              disableTouch
            >
              <SwiperItem className="modal-body-item">
                {dataList?.length ? (
                  <ScrollView onScrollToLower={onScrollToLower} className="modal-body-scroll" scrollY>
                    {dataList.map((item, index) => {
                      return (
                        <View key={index}>
                          <View className="modal-body-item-title">
                            <Text className="modal-body-item-title-left">
                              {item?.observeDate?.includes(`${fullYear}`)
                                ? dayjs(item.observeDate).format('MM-DD')
                                : item.observeDate}
                            </Text>
                            <Text
                              className={`${thirdStepChooseData?.length ? 'modal-body-item-title-rightchoose' : ''} modal-body-item-title-right`}
                              onClick={filterObserveList}
                            >
                              筛选幼儿
                            </Text>
                          </View>
                          {item?.observeList?.length
                            ? item?.observeList.map((item2, index2) => (
                              <View
                                className="modal-body-item-body"
                                key={item2?.observeId || index2}
                                onClick={() => chooseItem(item2)}
                              >
                                <View className="modal-body-item-flex">
                                  <Image
                                    src={
                                      firstChooseIds.includes(item2?.observeId)
                                        ? 'https://senior.cos.clife.cn/xiao-c/check@2x.png'
                                        : 'https://senior.cos.clife.cn/xiao-c/uncheck@2x.png'
                                    }
                                    className="modal-body-item-body-img"
                                  />
                                  <View className="modal-body-item-flex-right">
                                    <View className="modal-body-item-time">
                                      <Text>{item2.observeTime.slice(11, 16)}</Text>
                                      <Text
                                        className="modal-body-item-time-click"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          goDetail(item2);
                                        }}
                                      >
                                        查看详情
                                      </Text>
                                    </View>
                                    <View
                                      className={`modal-body-item-detail ${firstChooseIds.includes(item2?.observeId) ? 'modal-body-item-choosedetail' : ''}`}
                                    >
                                      <View className="modal-body-item-detail-flex">
                                        <Text className="modal-body-item-detail-flex-left">观察情境:</Text>
                                        <Text className="modal-body-item-detail-flex-right">
                                          <Text
                                            style={{
                                              overflow: 'hidden',
                                              textOverflow: 'ellipsis',
                                              whiteSpace: 'nowrap',
                                              display: 'block',
                                            }}
                                          >
                                            {item2?.situationList?.map((item3) => item3.situationName).join('、') ||
                                              ''}
                                          </Text>
                                        </Text>
                                      </View>
                                      <View className="modal-body-item-detail-flex">
                                        <Text className="modal-body-item-detail-flex-left">观察幼儿:</Text>
                                        <Text className="modal-body-item-detail-flex-right">
                                          <Text
                                            style={{
                                              overflow: 'hidden',
                                              textOverflow: 'ellipsis',
                                              whiteSpace: 'nowrap',
                                              display: 'block',
                                            }}
                                          >
                                            {item2?.studentList?.map((item3) => item3.studentName).join('、') || ''}
                                          </Text>
                                        </Text>
                                      </View>
                                      <View className="modal-body-item-detail-flex">
                                        <Text className="modal-body-item-detail-flex-left">观察内容：</Text>
                                        <View className="modal-body-item-detail-flex-right">
                                          <Text
                                            style={{
                                              overflow: 'hidden',
                                              textOverflow: 'ellipsis',
                                              whiteSpace: 'nowrap',
                                              display: 'block',
                                              height: 30,
                                            }}
                                          >
                                            {item2.content}
                                          </Text>
                                        </View>
                                      </View>
                                    </View>
                                  </View>
                                </View>
                              </View>
                            ))
                            : null}
                        </View>
                      );
                    })}
                  </ScrollView>
                ) : (
                  <View className="empty">
                    <Image src="https://senior.cos.clife.cn/xiao-c/empty.png" className="empty-img" />
                    <Text>暂无数据</Text>
                  </View>
                )}
              </SwiperItem>
              {submit && childList?.length ? (
                <SwiperItem className="modal-body-item">
                  {childList.map((item, index) => {
                    return (
                      <View
                        key={index}
                        className="modal-body-item-child"
                        onClick={() => secondClick && secondClick(item)}
                      >
                        <View className="modal-body-item-child-left">
                          <Image
                            src={
                              secondChooseIds.includes(item?.studentId)
                                ? 'https://senior.cos.clife.cn/xiao-c/check@2x.png'
                                : 'https://senior.cos.clife.cn/xiao-c/uncheck@2x.png'
                            }
                            className="modal-body-item-child-leftimg"
                          />
                          <Image
                            src={item?.avatar || 'https://senior.cos.clife.cn/xiao-c/default-head.png'}
                            className="modal-body-item-child-lefthead"
                          />
                          <Text className="modal-body-item-child-leftname">{item?.studentName}</Text>
                        </View>
                        <View className="modal-body-item-child-right">{item?.className}</View>
                      </View>
                    );
                  })}
                </SwiperItem>
              ) : null}

              {/* <SwiperItem className="modal-body-item" itemId="3">
                {submit && childList?.length
                  ? childList.map((item, index) => {
                      return (
                        <View
                          key={index}
                          className="modal-body-item-child"
                          onClick={() => secondClick && secondClick(item)}
                        >
                          <View className="modal-body-item-child-left">
                            <Image
                              src={
                                secondChooseIds.includes(item?.studentId)
                                  ? 'https://senior.cos.clife.cn/xiao-c/check@2x.png'
                                  : 'https://senior.cos.clife.cn/xiao-c/uncheck@2x.png'
                              }
                              className="modal-body-item-child-leftimg"
                            />
                            <Image
                              src={item?.avatar || 'https://senior.cos.clife.cn/xiao-c/default-head.png'}
                              className="modal-body-item-child-lefthead"
                            />
                            <Text className="modal-body-item-child-leftname">{item?.studentName}</Text>
                          </View>
                          <View className="modal-body-item-child-right">{item?.className}</View>
                        </View>
                      );
                    })
                  : null}
              </SwiperItem> */}

              {showRecordList && (
                <SwiperItem className="modal-body-item">
                  <ScrollView onScrollToLower={onScrollToLower} className="modal-body-scroll" scrollY>
                    {dataList.map((item, index) => {
                      return (
                        <View key={index}>
                          <View className="modal-body-item-title">
                            <Text className="modal-body-item-title-left">{item?.observeDate}</Text>
                            <Text
                              className={`${thirdStepChooseData?.length ? 'modal-body-item-title-rightchoose modal-body-item-title-right' : 'modal-body-item-title-right'} modal-body-item-title-right`}
                              onClick={filterObserveList}
                            >
                              筛选幼儿
                            </Text>
                          </View>
                          {item?.observeList?.length
                            ? item?.observeList.map((item2, index2) => (
                              <View className="modal-body-item-body" key={item2?.observeId || index2}>
                                <View className="modal-body-item-flex">
                                  <Image
                                    src={
                                      firstChooseIds.includes(item2?.observeId)
                                        ? 'https://senior.cos.clife.cn/xiao-c/check@2x.png'
                                        : 'https://senior.cos.clife.cn/xiao-c/uncheck@2x.png'
                                    }
                                    className="modal-body-item-body-img"
                                  />
                                  <View className="modal-body-item-flex-right" onClick={() => chooseItem(item2)}>
                                    <View className="modal-body-item-time">
                                      <Text>{item2.observeTime.slice(11, 16)}</Text>
                                      <Text
                                        className="modal-body-item-time-click"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          goDetail(item2);
                                        }}
                                      >
                                        查看详情
                                      </Text>
                                    </View>
                                    <View
                                      className={`modal-body-item-detail ${firstChooseIds.includes(item2?.observeId) ? 'modal-body-item-choosedetail' : ''}`}
                                    >
                                      <View className="modal-body-item-detail-flex">
                                        <Text className="modal-body-item-detail-flex-left">观察情境:</Text>
                                        <Text className="modal-body-item-detail-flex-right">
                                          <Text
                                            style={{
                                              overflow: 'hidden',
                                              textOverflow: 'ellipsis',
                                              whiteSpace: 'nowrap',
                                              display: 'block',
                                            }}
                                          >
                                            {item2?.situationList?.map((item3) => item3.situationName).join('、') ||
                                              ''}
                                          </Text>
                                        </Text>
                                      </View>
                                      <View className="modal-body-item-detail-flex">
                                        <Text className="modal-body-item-detail-flex-left">观察幼儿:</Text>
                                        <Text className="modal-body-item-detail-flex-right">
                                          <Text
                                            style={{
                                              overflow: 'hidden',
                                              textOverflow: 'ellipsis',
                                              whiteSpace: 'nowrap',
                                              display: 'block',
                                            }}
                                          >
                                            {item2?.studentList?.map((item3) => item3.studentName).join('、') || ''}
                                          </Text>
                                        </Text>
                                      </View>
                                      <View className="modal-body-item-detail-flex">
                                        <Text className="modal-body-item-detail-flex-left">观察内容：</Text>
                                        <View className="modal-body-item-detail-flex-right">
                                          <Text
                                            style={{
                                              overflow: 'hidden',
                                              textOverflow: 'ellipsis',
                                              whiteSpace: 'nowrap',
                                              display: 'block',
                                            }}
                                          >
                                            {item2.content}
                                          </Text>
                                        </View>
                                      </View>
                                    </View>
                                  </View>
                                </View>
                              </View>
                            ))
                            : null}
                        </View>
                      );
                    })}
                  </ScrollView>
                </SwiperItem>
              )}

              {resourceList?.length ? (
                <SwiperItem className="modal-body-item" itemId="4">
                  <View className="modal-body-item-flex2">
                    <View className="modal-body-item-flex2-left">
                      <ScrollView scrollY>
                        {resourceList?.length
                          ? resourceList.map((item, idx) => (
                            <View
                              className={`${chooseResourceNum === item?.classId ? 'select-choose-item' : ''} select-item`}
                              key={item?.classId || idx}
                              onClick={() => onChangeResoureceNum(item)}
                            >
                              {item?.className?.length > 5 ? item?.className?.slice(0, 5) + '...' : item?.className}
                            </View>
                          ))
                          : null}
                      </ScrollView>
                    </View>
                    <View className="modal-body-item-flex2-right">
                      <ScrollView scrollY>
                        {chooseResourceList?.length ? (
                          <View className="resource-studenlist">
                            {chooseResourceList.map((item, idx) => (
                              <View
                                key={item?.studentId || idx}
                                className={`${copyThirdStepChooseData.includes(item?.studentId) ? 'resource-studenlist-chooseitem' : ''} resource-studenlist-item`}
                                onClick={() => chooseThirdStepData && chooseThirdStepData(item?.studentId)}
                              >
                                <Image
                                  src={item?.avatar || 'https://senior.cos.clife.cn/xiao-c/default-head.png'}
                                  className="resource-studenlist-item-img"
                                />
                                <Text className="resource-studenlist-item-text">
                                  {item?.studentName?.length > 3
                                    ? item?.studentName?.slice(0, 3) + '...'
                                    : item?.studentName}
                                </Text>
                              </View>
                            ))}
                          </View>
                        ) : null}
                      </ScrollView>
                    </View>
                  </View>
                </SwiperItem>
              ) : null}
              {/* <SwiperItem className="modal-body-item" itemId="4">
                <View className="modal-body-item-flex2">
                  <View className="modal-body-item-flex2-left">
                    <ScrollView scrollY>
                      {resourceList?.length
                        ? resourceList.map((item, idx) => (
                            <View
                              className={`${chooseResourceNum === item?.classId ? 'select-choose-item' : ''} select-item`}
                              key={item?.classId || idx}
                              onClick={() => onChangeResoureceNum(item)}
                            >
                              {item?.className?.length > 5 ? item?.className?.slice(0, 5) + '...' : item?.className}
                            </View>
                          ))
                        : null}
                    </ScrollView>
                  </View>
                  <View className="modal-body-item-flex2-right">
                    <ScrollView scrollY>
                      {chooseResourceList?.length ? (
                        <View className="resource-studenlist">
                          {chooseResourceList.map((item, idx) => (
                            <View
                              key={item?.studentId || idx}
                              className={`${thirdStepChooseData.includes(item?.studentId) ? 'resource-studenlist-chooseitem' : ''} resource-studenlist-item`}
                              onClick={() => chooseThirdStepData && chooseThirdStepData(item?.studentId)}
                            >
                              <Image
                                src={item?.avatar || 'https://senior.cos.clife.cn/xiao-c/default-head.png'}
                                className="resource-studenlist-item-img"
                              />
                              <Text className="resource-studenlist-item-text">
                                {item?.studentName?.length > 3
                                  ? item?.studentName?.slice(0, 3) + '...'
                                  : item?.studentName}
                              </Text>
                            </View>
                          ))}
                        </View>
                      ) : null}
                    </ScrollView>
                  </View>
                </View>
              </SwiperItem> */}
            </Swiper>
            <View className="modal-bottom">
              {(step === 0 || showRecordList) && step !== 2 ? (
                <View className="modal-bottom-first">
                  {showCancel ? (
                    <View className="modal-bottom-first-cancel" onClick={handleClose}>
                      取消
                    </View>
                  ) : null}
                  <View className="modal-bottom-first-confirm" onClick={firstClick}>
                    {firstText}
                  </View>
                </View>
              ) : step === 1 && firstStepChooseData?.length && !onTabsChange ? (
                <View className="modal-bottom-second">
                  <View className="modal-bottom-second-left" onClick={() => changeStep(0)}>
                    上一步
                  </View>
                  <View className="modal-bottom-second-right" onClick={submit}>
                    {secondText}
                  </View>
                </View>
              ) : step === 2 || (step === 1 && resourceList?.length) ? (
                <View className="modal-bottom-second">
                  <View className="modal-bottom-second-left" onClick={reset}>
                    重置
                  </View>
                  <View className="modal-bottom-second-right" onClick={sureStudentListBtn}>
                    确定
                  </View>
                </View>
              ) : null}
            </View>
          </View>
          {/* </AtFloatLayout> */}
        </PageContainer>
      </RootPortal>
    )
  );
};

export default ChooseModal;
