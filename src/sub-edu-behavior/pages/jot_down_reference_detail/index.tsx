import React, { useEffect, useState } from 'react';
import { useRouter } from '@tarojs/taro';
import { useRequest } from 'ahooks';
import { getObserveDetailApi, getStuDataDetailApi } from '@sub-edu-behavior/request';
import ReferenceDetail, { EModules } from '@sub-edu-behavior/components/ReferenceDetail';
import { EEduBehaviorTag } from '@sub-edu-behavior/interface';
import { IUserParams } from '../jot_down_detail';
import './index.less';

const JotDownReferenceDetail = () => {
  const router = useRouter();
  const [userParams, setUserParams] = useState<IUserParams>();
  const [modules, setModules] = useState<EModules[]>();

  const { data: studentsData = [], run: getStuDataDetail } = useRequest(getStuDataDetailApi, { manual: true });
  const { data: observeData, run: getObserveDetail } = useRequest(getObserveDetailApi, { manual: true });

  useEffect(() => {
    if (router.params.observeId) {
      getObserveDetail({ observeId: Number(router.params.observeId) });
    }
  }, [router]);
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
      setUserParams(params);
      const studentIds = observeData.studentList.map((item) => item.studentId).join(',');
      getStuDataDetail({ studentIds: studentIds, observeDate: observeData.observeDate });
      const modules = observeData.sectorTypeList
        ?.map((item) => {
          return item.sectorList.map((sector) => {
            return sector.module?.split(',') || [];
          });
        })
        .flat(2);
      console.log('=modules', modules);
      setModules([...new Set(modules as EModules[])]);
    }
  }, [observeData]);

  return <ReferenceDetail modules={modules} data={studentsData} observationdetail={userParams} />;
};

export default JotDownReferenceDetail;
