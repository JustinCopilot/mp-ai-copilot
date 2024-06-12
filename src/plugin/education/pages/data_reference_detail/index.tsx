import React, { useEffect, useState } from 'react';
import { useRouter } from '@tarojs/taro';
import { ReferenceDetail, DataType } from '@edu/components';
import { getStuDataDetail } from '@edu/request';
import type { StudentInfo } from '@edu/components';
// import dayjs from 'dayjs';
import './index.less';

// const data = [
//   {
//     studentId: 26542,
//     studentName: '周航伊',
//     avatar: 'http://cos.clife.net/campus/4b72b6936ae58ce96fe5b37aae180b01.jpg',
//     sex: 1,
//     age: 6,
//     className: '混龄1班',
//     height: 122.3,
//     heightAssess: '中+',
//     weight: 24.1,
//     weightAssess: '中+',
//     level: 1,
//     measureTime: '2024-03-24 18:00:00',
//     dataList: [
//       {
//         timeLength: null,
//         week: 5,
//         locationName: null,
//         dataTime: '2024-05-03',
//         sleepDuration: null,
//         waterAmount: 400,
//       },
//       {
//         timeLength: null,
//         week: 6,
//         locationName: null,
//         dataTime: '2024-05-04',
//         sleepDuration: null,
//         waterAmount: null,
//       },
//       {
//         timeLength: null,
//         week: 7,
//         locationName: null,
//         dataTime: '2024-05-05',
//         sleepDuration: null,
//         waterAmount: null,
//       },
//       {
//         timeLength: null,
//         week: 1,
//         locationName: null,
//         dataTime: '2024-05-06',
//         sleepDuration: null,
//         waterAmount: 200,
//       },
//       {
//         timeLength: null,
//         week: 2,
//         locationName: null,
//         dataTime: '2024-05-07',
//         sleepDuration: null,
//         waterAmount: null,
//       },
//       {
//         timeLength: null,
//         week: 3,
//         locationName: null,
//         dataTime: '2024-05-08',
//         sleepDuration: null,
//         waterAmount: null,
//       },
//       {
//         timeLength: null,
//         week: 4,
//         locationName: null,
//         dataTime: '2024-05-09',
//         sleepDuration: null,
//         waterAmount: null,
//       },
//     ],
//     top5List: [
//       {
//         observeId: 693,
//         content: '当交警反馈发',
//         imgUrl: null,
//         observeDate: '2024-01-05',
//         observeTime: '2024-01-05 10:12:55',
//       },
//       {
//         observeId: 603,
//         content: 'daas ',
//         imgUrl: null,
//         observeDate: '2023-11-08',
//         observeTime: '2023-11-08 09:15:51',
//       },
//       {
//         observeId: 552,
//         content: '大学城',
//         imgUrl: null,
//         observeDate: '2023-10-27',
//         observeTime: '2023-10-27 11:48:30',
//       },
//       {
//         observeId: 580,
//         content: '1',
//         imgUrl: null,
//         observeDate: '2023-10-26',
//         observeTime: '2023-10-26 20:19:08',
//       },
//     ],
//   },
//   {
//     studentId: 150864473882625,
//     studentName: '潘尤可1号',
//     avatar: 'http://cos.clife.net/campus/e78f6fcbbafed178e5d1b2c0c278ed7c.jpg',
//     sex: 1,
//     age: 6,
//     className: '混龄1班',
//     height: 122.3,
//     heightAssess: '中+',
//     weight: 24.1,
//     weightAssess: '中+',
//     level: 1,
//     measureTime: '2024-03-24 18:00:00',
//     dataList: [
//       {
//         timeLength: null,
//         week: 5,
//         locationName: null,
//         dataTime: '2024-05-03',
//         sleepDuration: null,
//         waterAmount: 400,
//       },
//       {
//         timeLength: null,
//         week: 6,
//         locationName: null,
//         dataTime: '2024-05-04',
//         sleepDuration: null,
//         waterAmount: null,
//       },
//       {
//         timeLength: null,
//         week: 7,
//         locationName: null,
//         dataTime: '2024-05-05',
//         sleepDuration: null,
//         waterAmount: null,
//       },
//       {
//         timeLength: null,
//         week: 1,
//         locationName: null,
//         dataTime: '2024-05-06',
//         sleepDuration: null,
//         waterAmount: 200,
//       },
//       {
//         timeLength: null,
//         week: 2,
//         locationName: null,
//         dataTime: '2024-05-07',
//         sleepDuration: null,
//         waterAmount: null,
//       },
//       {
//         timeLength: null,
//         week: 3,
//         locationName: null,
//         dataTime: '2024-05-08',
//         sleepDuration: null,
//         waterAmount: null,
//       },
//       {
//         timeLength: null,
//         week: 4,
//         locationName: null,
//         dataTime: '2024-05-09',
//         sleepDuration: null,
//         waterAmount: null,
//       },
//     ],
//     top5List: [
//       {
//         observeId: 693,
//         content: '当交警反馈发',
//         imgUrl: null,
//         observeDate: '2024-01-05',
//         observeTime: '2024-01-05 10:12:55',
//       },
//       {
//         observeId: 603,
//         content: 'daas ',
//         imgUrl: null,
//         observeDate: '2023-11-08',
//         observeTime: '2023-11-08 09:15:51',
//       },
//       {
//         observeId: 552,
//         content: '大学城',
//         imgUrl: null,
//         observeDate: '2023-10-27',
//         observeTime: '2023-10-27 11:48:30',
//       },
//       {
//         observeId: 580,
//         content: '1',
//         imgUrl: null,
//         observeDate: '2023-10-26',
//         observeTime: '2023-10-26 20:19:08',
//       },
//     ],
//   },
// ]
export const DataReferenceDetails = () => {
  const router = useRouter();
  const [data, setData] = useState<StudentInfo[]>([]);

  useEffect(() => {
    if (router.params.studentIds) {
      getStuDataDetail({
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
