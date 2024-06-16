import React, { useEffect, useState } from 'react';
import { useRouter } from '@tarojs/taro';
import { ReferenceDetail, DataType } from '@sub-edu-behavior/components';
import { getStuDataDetailApi } from '@sub-edu-behavior/request';
import type { StudentInfo } from '@sub-edu-behavior/components';
import './index.less';

export const DataReferenceDetails = () => {
  const router = useRouter();
  const [data, setData] = useState<StudentInfo[]>([]);

  useEffect(() => {
    if (router.params.studentIds) {
      getStuDataDetailApi({
        studentIds: router.params.studentIds,
        observeDate: router.params.observeDate,
        source: router.params.source as any,
        correlateId: router.params.correlateId,
      }).then(setData);
    }
  }, [router]);
  return <ReferenceDetail data={data} type={DataType.observe} />;
};

export default DataReferenceDetails;
