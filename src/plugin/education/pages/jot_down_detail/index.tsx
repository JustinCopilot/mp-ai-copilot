import React, { useEffect, useRef, useState } from 'react';
import { Text, View } from '@tarojs/components';
import InfoExtractionBlock from '@plugin/education/components/InfoExtractionBlock';
import Taro, { useDidShow, useRouter } from '@tarojs/taro';
import { getObserveDetailApi, removeObserveApi } from '@plugin/education/request';
import { useRequest } from 'ahooks';
import dayjs from 'dayjs';
import { getPageInstance } from '@plugin/utils';
import { EPageFrom } from '@plugin/types';
import { PRE_PLUGIN_PATH } from '@plugin/constants';
import { getBaseUrl, isProdEnv } from '@plugin/utils/https';
import { getToken } from '@plugin/utils/token';
import type { IGetAnswerResultParams } from '@plugin/stores/ChatWrapperContext';
import { getHistoryChatApi, interruptSessionApi } from '@plugin/request';
import { EMicroAppIdITest, EMicroAppIdProd } from '@plugin/request/chat/type';
import { EEduBehaviorTag } from '@plugin/education/interface';
import AlertModal from '@plugin/components/AlertModal';
import useStreamToArray from '@plugin/components/ChatWrapper/hooks/useStreamToArray';
import 'taro-ui/dist/style/components/nav-bar.scss';
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
    sex: number;
    avatar: string;
    studentName: string;
  }[];
  tag: EEduBehaviorTag;
  flag?: boolean;
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
}

export const JotDownDetail = () => {
  const router = useRouter();
  const [isOpened, setIsOpened] = useState(false);
  const [agentResponse, setAgentResponse] = useState<Common>();
  const [analyzeStatus, setAnalyzeStatus] = useState(EAnalyzeStatus.UN_ANALYZE);
  const [userParams, setUserParams] = useState<IUserParams>();
  const { data: observeData, run: getObserveDetail } = useRequest(getObserveDetailApi, { manual: true });
  const copyAgentResponse = useRef<Common>();
  const chatRequestRef = useRef<Taro.RequestTask<any>>();

  const { transformStreamToArray } = useStreamToArray();

  const closeModal = () => setIsOpened(false);
  const linkHandle = () => {
    const studentIds = observeData?.studentList.map((item) => item.studentId).join(',');
    Taro.navigateTo({ url: `${PRE_PLUGIN_PATH}/jot_down_reference_detail?studentIds=${studentIds}` });
  };
  const updateHandle = () => {
    const currentPage = getPageInstance();
    currentPage.setData({
      observationdetail: userParams,
    });
    Taro.navigateTo({ url: `${PRE_PLUGIN_PATH}/information_supplement` });
  };
  const refreshHandle = (userParams: IUserParams) => {
    console.log('重新请求');
    getAnswerResult({ userParam: userParams });
  };
  const deleteHandle = () => {
    removeObserveApi({ observeId: Number(router.params.observeId) })
      .then(() => {
        Taro.showToast({
          title: '删除成功',
          icon: 'none',
        });
        setTimeout(() => {
          Taro.navigateBack();
        }, 1000);
      })
      .finally(() => {
        closeModal();
      });
  };

  const getAnswerResult = (params: IGetAnswerResultParams) => {
    console.log('触发流式对话', params);
    setAnalyzeStatus(EAnalyzeStatus.STAR_ANALYZE);
    chatRequestRef.current = Taro.request({
      method: 'POST',
      url: `${getBaseUrl()}/v1/microApp/chat`,
      enableChunked: true,
      responseType: 'text',
      data: { microAppId: isProdEnv() ? EMicroAppIdProd.EDU_JOT_DOWN : EMicroAppIdITest.EDU_JOT_DOWN, ...params },
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
      setAgentResponse(agentResponse);
    });
  };
  const abortChatRequest = () => {
    chatRequestRef.current?.abort();
    interruptSessionApi({ microAppId: EMicroAppIdITest.EDU_JOT_DOWN });
  };

  useDidShow(() => {
    const currentPage = getPageInstance();
    if (currentPage.data.from === EPageFrom.EDIT_OBSERVATION) {
      const observationdetail = currentPage.data.observationdetail;
      console.log('=observationdetail', observationdetail);
      setUserParams(observationdetail);
      refreshHandle(observationdetail);
    }
  });
  useEffect(() => {
    if (observeData) {
      const params: IUserParams = {
        tag: EEduBehaviorTag.BehaviorRecord,
        flag: !!observeData.flag,
        resultType: '目标问题',
        observeId: observeData.observeId,
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
      const currentPage = getPageInstance();
      currentPage.setData({
        observationdetail: params,
      });
      setUserParams(params);
    }
  }, [observeData]);
  useEffect(() => {
    console.log('agentResponse', agentResponse);
    copyAgentResponse.current = agentResponse;
  }, [agentResponse]);
  useEffect(() => {
    if (router.params.observeId) {
      getObserveDetail({ observeId: Number(router.params.observeId) });
    }
  }, [router]);
  useEffect(() => {
    const prePage = getPageInstance(-1);
    prePage.setData({ isRefresh: true });
    getHistoryChatApi({
      microAppId: EMicroAppIdITest.EDU_JOT_DOWN,
      ...{
        pageNumb: 9999,
        pageSize: 10,
      },
    });
  }, []);

  return (
    <View className="jot-down-detail">
      <View className="student-info">
        {userParams && <InfoExtractionBlock students={userParams.student} extractInfo={userParams.extractInfo} />}
      </View>
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
          <View className="btn retry" onClick={() => refreshHandle(userParams!)}>
            重试
          </View>
        </View>
      )}
      {(observeData || agentResponse) && analyzeStatus === EAnalyzeStatus.UN_ANALYZE && (
        <>
          <View className="analyze-info">
            {agentResponse ? (
              <>
                <Text decode>{agentResponse.content}</Text>
                <View className="update-time">最新修改日期 {dayjs().format('YYYY-MM-DD')}</View>
              </>
            ) : (
              <>
                {observeData?.studentList.map((item) => {
                  return item.evaluate ? (
                    <View className="analyze-item" key={item.studentId}>
                      <View className="header">对{item.studentName}的行为分析建议</View>
                      <View className="content">{item.evaluate}</View>
                    </View>
                  ) : null;
                })}
                {observeData?.updateTime && (
                  <View className="update-time">最新修改日期 {observeData.updateTime.slice(0, 10)}</View>
                )}
              </>
            )}
          </View>
          <View className="operation">
            <View className="update" onClick={updateHandle}>
              <View className="icon update-icon" />
            </View>
            <View className="delete" onClick={() => setIsOpened(true)}>
              <View className="icon delete-icon" />
            </View>
            <View className="refresh" onClick={() => refreshHandle(userParams!)}>
              <View className="icon refresh-icon" />
              重新生成
            </View>
            <View className="link" onClick={linkHandle}>
              <View className="icon link-icon" />
              查看数据引用详情
            </View>
          </View>
        </>
      )}
      <AlertModal
        isOpened={isOpened}
        closeHandle={closeModal}
        okHandle={deleteHandle}
        content="确定要删除这条随手记吗？"
        okText="删除"
      />
    </View>
  );
};

export default JotDownDetail;
