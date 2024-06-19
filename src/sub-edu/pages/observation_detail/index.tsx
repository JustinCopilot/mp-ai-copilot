/* eslint-disable max-nested-callbacks */
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useRequest } from 'ahooks';
import { AtModal, AtModalAction } from 'taro-ui';
import dayjs from 'dayjs';

import { View, Button, Text, Image } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { PRE_EDU_PATH } from '@common/constants';
import { getPageInstance } from '@common/utils';
import { getObserveDetailApi, removeObserveApi } from '@sub-edu/request';
import { EEduBehaviorTag } from '@sub-edu/interface';
import { EMicroAppUuid } from '@plugin/request/chat/type';
import { interruptSessionApi } from '@plugin/request';
import { getToken } from '@common/utils/token';
import { getBaseUrl } from '@common/utils/https';
import type { IGetAnswerResultParams } from '@plugin/stores/ChatWrapperContext';
import useStreamToArray from '@plugin/components/ChatWrapper/hooks/useStreamToArray';

import ObservationRecord from '../../components/ObservationRecord/index';

import './index.less';

export enum EAnalyzeStatus {
  UN_ANALYZE,
  STAR_ANALYZE,
  ERROR_ANALYZE,
}

export interface IUserParams {
  observeId: number;
  student: {
    birthday: string;
    studentId: number;
    classId: number;
    sex: number;
    avatar: string;
    studentName: string;
  }[];
  tag: EEduBehaviorTag;
  resultType: '目标问题';
  extractInfo: {
    date: string;
    input: string;
    situationList?: string[];
    photo: {
      aiImgUrl?: string;
      imgUrl?: string;
      videoUrl?: string;
      videoCoverUrl?: string;
    };
    sectorList?: {
      area: string;
      sub: string[];
    }[];
  };
  hideBtn?: boolean | string;
}

const Observationdetail = () => {
  const router = useRouter();
  const [isOpened, setIsOpened] = useState(false);
  const [agentResponse, setAgentResponse] = useState<Common>();
  const [userParams, setUserParams] = useState<IUserParams>();
  const [analyzeStatus, setAnalyzeStatus] = useState(EAnalyzeStatus.UN_ANALYZE);
  const chatRequestRef = useRef<Taro.RequestTask<any>>();
  const { transformStreamToArray } = useStreamToArray();
  const { data: observeData, run: getObserveDetail } = useRequest(getObserveDetailApi, { manual: true });

  const closeModal = () => setIsOpened(false);
  const linkHandle = () => {
    const studentIds = observeData?.studentList?.map((item) => item.studentId).join(',');
    Taro.navigateTo({
      url: `${PRE_EDU_PATH}/data_reference_detail/index?source=1&studentIds=${studentIds}&observeDate=${observeData?.observeDate}&correlateId=${observeData?.correlateId}`,
    });
  };
  const observeDataDetail = useMemo(() => {
    const {
      studentList = [],
      observeDate,
      aiImgUrl,
      imgUrl,
      videoUrl,
      videoCoverUrl,
      sectorTypeList,
      situationList,
      cure, // 措施
      analysis, // 建議
      content, // 内容
      observeId,
      correlateId,
    } = observeData || {};

    let behavior: any[] = [];
    studentList.forEach((item) => {
      const { behaviorList, studentId, studentName } = item;
      let NewSectorList: any[] = [];
      if (behaviorList?.length) {
        behaviorList.forEach((behaviorItem) => {
          const { typeName, sectorList } = behaviorItem;
          if (sectorList?.length) {
            sectorList.forEach((sectorItem: any) => {
              const { sectorName, behaviorList } = sectorItem;
              NewSectorList.push({
                area: typeName,
                sub: sectorName,
                chosen: behaviorList?.length
                  ? behaviorList.map((child3) => {
                    const { contentList, title } = child3;
                    return {
                      level: contentList?.length ? `L${contentList[0].level} ` : '',
                      level_standard: contentList?.length ? `L${contentList[0].content} ` : '',
                      title,
                    };
                  })
                  : [],
              });
            });
          }
        });
      }
      behavior.push({
        studentId,
        studentName,
        sectorList: NewSectorList,
      });
    });

    const newSectorTypeList = sectorTypeList?.length
      ? sectorTypeList.map((item2) => {
        return {
          area: item2?.typeName || '',
          sub: item2?.sectorList?.length ? item2?.sectorList?.map((item3) => item3?.sectorName) : [],
        };
      })
      : null;

    const newContent = `## 观察分析：${analysis || ''}## 跟进措施：${cure || ''}`;
    const extractInfo = {
      date: observeDate,
      input: content,
      photo: { aiImgUrl, imgUrl, videoUrl, videoCoverUrl },
      sectorList: newSectorTypeList,
      situationList: situationList?.map((item) => item.situationName) || [],
      behavior,
    };
    return {
      student: studentList || [],
      content: agentResponse?.content || newContent,
      extractInfo,
      observeId,
      tag: '已归档',
      correlateId,
    };
  }, [observeData, agentResponse, analyzeStatus]);

  useEffect(() => {
    if (observeData) {
      const params: IUserParams = {
        tag: EEduBehaviorTag.BehaviorRecord,
        student: observeData.studentList.map((student) => {
          const { birthday, studentId, sex, studentName, avatar } = student;
          return {
            birthday,
            studentId,
            sex,
            avatar,
            studentName,
          };
        }),
        extractInfo: {
          date: observeData.observeDate,
          input: observeData.content,
          situationList: observeData.situationList?.map((item) => item.situationName),
          photo: {
            imgUrl: observeData.imgUrl,
            aiImgUrl: observeData.aiImgUrl,
            videoCoverUrl: observeData.videoCoverUrl,
            videoUrl: observeData.videoUrl,
          },
          sectorList: observeData.sectorTypeList?.map((sectorType) => {
            return {
              area: sectorType.typeName,
              sub: sectorType.sectorList.map((sector) => sector.sectorName),
            };
          }),
        },
      };
      setUserParams(params);
    }
  }, [observeData]);

  useEffect(() => {
    if (router.params.observeId) {
      getObserveDetail({ observeId: Number(router.params.observeId) });
    }
  }, [router]);

  useDidShow(() => {
    // 刷新页面逻辑
    const currentPage = getPageInstance();
    // console.log('currentPage666', Number(router.params.observeId));
    if (currentPage.data.from === 'archive_observation') {
      // console.log('是否进入');
      getObserveDetail({ observeId: Number(router.params.observeId) });
    }
  });

  const updateHandle = () => {
    const currentPage = getPageInstance();
    currentPage.setData({
      observationdetail: observeDataDetail,
    });
    Taro.navigateTo({ url: `${PRE_EDU_PATH}/archive_observation/index` });
  };

  const abortChatRequest = () => {
    chatRequestRef.current?.abort();
    interruptSessionApi({ microAppUuid: EMicroAppUuid.EDU_JOT_DOWN });
  };

  const getAnswerResult = (params: IGetAnswerResultParams) => {
    setAnalyzeStatus(EAnalyzeStatus.STAR_ANALYZE);
    chatRequestRef.current = Taro.request({
      method: 'POST',
      url: `${getBaseUrl()}/v1/microApp/chat`,
      enableChunked: true,
      responseType: 'text',
      data: { microAppUuid: EMicroAppUuid.EDU_OBSERVATION, ...params },
      // timeout: CHAT_TIMEOUT,
      header: {
        Authorization: getToken(),
      },
      complete() {
        setAnalyzeStatus(EAnalyzeStatus.UN_ANALYZE);
      },
      fail() {
        setAnalyzeStatus(EAnalyzeStatus.ERROR_ANALYZE);
      },
    });
    chatRequestRef.current.onChunkReceived((stream) => {
      const streamDataArr = transformStreamToArray(stream);
      if (!streamDataArr) return;

      let agentResponse: IUserParams | undefined;
      console.log('streamDataArr==', streamDataArr);

      if (streamDataArr[0].errCode !== 0) {
        setAnalyzeStatus(EAnalyzeStatus.ERROR_ANALYZE);
        return;
      }

      streamDataArr.forEach((item) => {
        const { data } = item;
        agentResponse = JSON.parse(data?.agentResponse || '{}')?.data;
      });
      console.log('agentResponse==', agentResponse);
      setAgentResponse(agentResponse);
    });
  };

  const refreshHandle = () => {
    console.log('重新请求', userParams);
    getAnswerResult({ userParam: userParams });
  };

  return observeData ? (
    <View className="observation-detail">
      <ObservationRecord detail={observeDataDetail} showBtn={false} analyzeStatus={analyzeStatus} showMore={false} />
      {analyzeStatus === EAnalyzeStatus.STAR_ANALYZE && (
        <View className="loading-error">
          <View className="text">分析建议加载中…</View>
          <View className="btn cancel" onClick={abortChatRequest}>
            取消
          </View>
        </View>
      )}
      {analyzeStatus === EAnalyzeStatus.ERROR_ANALYZE && (
        <View className="loading-error">
          <View className="text">分析建议加载失败</View>
          <View className="sub-text">请检查网络设置</View>
          <View className="btn retry" onClick={() => refreshHandle()}>
            重试
          </View>
        </View>
      )}
      {(observeData || agentResponse) && analyzeStatus === EAnalyzeStatus.UN_ANALYZE && (
        <>
          <View className="analyze-info">
            {agentResponse ? (
              <>
                {/* <Text decode>{agentResponse.content}</Text> */}
                <View className="update-time">最新修改日期 {dayjs().format('YYYY-MM-DD')}</View>
              </>
            ) : (
              <>
                {/* {observeData?.studentList.map((item) => {
                  return (
                    <View className="analyze-item" key={item.studentId}>
                      <View className="header">对{item.studentName}的行为分析建议</View>
                      <View className="content">{item.evaluate}</View>
                    </View>
                  );
                })} */}
                {observeData?.updateTime && (
                  <View className="update-time">最新修改日期 {observeData.updateTime.slice(0, 10)}</View>
                )}
              </>
            )}
          </View>
          <View className="operation">
            {!router.params.hideBtn && (
              <View className="operation-flex">
                <View className="update left-btn" onClick={updateHandle}>
                  <View className="icon update-icon" />
                </View>
                <View className="delete left-btn" onClick={() => setIsOpened(true)}>
                  <View className="icon delete-icon" />
                </View>
              </View>
            )}

            {/* <View className="refresh" onClick={refreshHandle}>
              <View className="icon refresh-icon" />
              重新生成
            </View> */}
            <View className="link" onClick={linkHandle}>
              <Image src="https://senior.cos.clife.cn/xiao-c/link@2x.png" className="link-img" />
              {/* <View className="icon link-icon" /> */}
              <Text>查看数据引用详情</Text>
            </View>
          </View>
        </>
      )}
      <AtModal isOpened={isOpened} onClose={closeModal}>
        <View className="modal-content">
          <View className="header">确定删除这条记录吗？</View>
        </View>
        <AtModalAction>
          <Button onClick={closeModal}>取消</Button>
          <Button
            onClick={() => {
              removeObserveApi({ observeId: Number(router.params.observeId) })
                .then(() => {
                  Taro.showToast({
                    title: '删除成功',
                    icon: 'none',
                  });
                  Taro.navigateBack();
                })
                .finally(() => {
                  closeModal();
                });
            }}
          >
            删除
          </Button>
        </AtModalAction>
      </AtModal>
    </View>
  ) : null;
};
export default Observationdetail;
