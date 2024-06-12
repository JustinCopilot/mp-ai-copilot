import React, { useEffect, useState } from 'react';
import { useRouter } from '@tarojs/taro';
import { useRequest } from 'ahooks';
import { getStuDataDetail } from '@plugin/education/request';
import ReferenceDetail from '@plugin/education/components/ReferenceDetail';
import { getPageInstance } from '@plugin/utils';
import './index.less';
import { IUserParams } from '../jot_down_detail';

const JotDownReferenceDetail = () => {
  const router = useRouter();
  const [observationdetail, setObservationdetail] = useState<IUserParams>();

  const { data: studentsData = [], run } = useRequest(getStuDataDetail, { manual: true });

  useEffect(() => {
    if (router.params) {
      run({ studentIds: router.params.studentIds });
    }
  }, [router]);
  useEffect(() => {
    const prePage = getPageInstance(-1);
    const observationdetail = prePage.data.observationdetail;
    console.log('=observationdetail', observationdetail);
    setObservationdetail(observationdetail);
  }, []);

  return <ReferenceDetail data={studentsData} observationdetail={observationdetail} />;
};

export default JotDownReferenceDetail;
