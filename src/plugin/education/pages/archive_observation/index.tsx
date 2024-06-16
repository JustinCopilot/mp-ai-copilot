import React, { useEffect } from 'react';
import { getPageInstance } from '@plugin/utils';
import { useReducer } from '@plugin/education/utils';
import { Archive, Props } from '@edu/components/archive';
import Taro, { useRouter } from '@tarojs/taro';
import { saveOrUpdate, getObserveSetting, microAppTag } from '@edu/request';
import './index.less';

interface State extends Omit<Props, 'submit'> {
  uniqueId: string;
  observeId?: string;
  correlateId?: string;
}
const initialState: State = {
  selectStudent: [],
  observeSituation: [],
  sectorValue: [],
  observeTime: '',
  showParentVisible: false,
  parentVisible: false,
  observeContent: '',
  observeAnalysis: '',
  observeFollow: '',
  observePhoto: {},
  uniqueId: '',
  observeId: '',
  correlateId: '',
};
export const ArchiveObservation = () => {
  const router = useRouter();
  const [state, dispatch] = useReducer<State>(initialState);

  const { uniqueId, observeId, correlateId } = state || {};
  useEffect(() => {
    const prePage = getPageInstance(-1);
    const uniqueId = prePage?.data?.uniqueId;

    const observationdetail = prePage?.data?.observationdetail;
    // console.log('🚀🚀🚀🚀🚀🚀  observationdetail:', JSON.stringify(observationdetail));
    // const observationdetail = mockData;
    console.log('🚀🚀🚀🚀🚀🚀  observationdetail:', observationdetail);

    const { content, student, extractInfo, observeId, correlateId } = observationdetail || {};
    Taro?.setNavigationBarTitle?.({
      title: observeId ? '编辑归档记录' : '归档观察记录',
    });
    const contentSplit = content?.split('## 跟进措施：');
    const observeAnalysis = contentSplit?.[0].replace('## 观察分析：', '');
    const observeFollow = contentSplit?.[1];
    const { situationList, date, sectorList, input, photo, behavior } = extractInfo || {};
    const sectorValue = sectorList?.map(({ sub }) => sub)?.flat(2) || [];
    const observeSituation =
      situationList?.[0]?.situationId || situationList?.[0]?.situationName
        ? situationList?.map((i) => i?.situationId)
        : situationList || [];
    const studentList = student?.map(({ studentId, ...rest }) => ({
      ...rest,
      studentId,
      data: behavior
        ?.find((i) => i?.studentId === studentId)
        ?.sectorList?.reduce((p, c) => {
          const { area, sub, chosen } = c || {};
          let findIndex = p?.findIndex((i) => i?.typeName === area);
          findIndex = !findIndex && findIndex !== 0 ? -1 : findIndex;
          if (findIndex === -1) {
            p?.push({
              typeName: area,
              data: [
                {
                  label: sub,
                  data: chosen?.map(({ title, level }) => {
                    return {
                      label: title,
                      level: Number(level?.replaceAll('L', '') || ''),
                    };
                  }),
                },
              ],
            });
          } else {
            p?.[findIndex]?.data?.push({
              label: sub,
              data: chosen?.map(({ title, level }) => {
                return {
                  label: title,
                  level: Number(level?.replaceAll('L', '') || ''),
                };
              }),
            });
          }
          return p;
        }, []),
    }));
    dispatch('state', {
      selectStudent: studentList,
      observeAnalysis,
      observeFollow,
      observeSituation,
      observeTime: date,
      sectorValue,
      observeContent: input,
      observePhoto: photo,
      uniqueId,
      correlateId,
      observeId,
    });
    getSetting();
  }, []);
  const getSetting = async () => {
    const data = (await getObserveSetting()) || {};
    const { status, flag } = data || {};
    dispatch('state', { parentVisible: flag === 1, showParentVisible: status === 0 });
  };

  const onSubmit: Props['submit'] = async (values) => {
    console.log('🚀🚀🚀🚀🚀🚀  values:', values);
    const {
      observeContent: content,
      observeTime: observeDate,
      // sectorValue,
      situationList,
      // observeSituation,
      studentList,
      observeAnalysis: analysis,
      observeFollow: cure,
      parentVisible,
      sectorList,
      observePhoto,
    } = values || {};
    const opts = {
      content,
      observeDate,
      // sectorId: sectorValue?.join(','),
      sectorName: sectorList?.map((i) => i?.label)?.join(','),
      // situationList: observeSituation?.join(','),
      // situationName: observeSituation?.join(','),
      situationName: situationList?.map((i) => i?.label)?.join(','),
      studentList: JSON.stringify(studentList),
      correlateId: correlateId || router.params?.correlateId,
      analysis,
      ...(observePhoto || {}),
      observeId,
      cure,
      source: 1,
      flag: parentVisible ? 1 : 0,
    };
    console.log('🚀🚀🚀🚀🚀🚀  opts:', opts);
    const onBack = (type = 1) => {
      Taro.hideToast();
      Taro.showToast({
        title: type === 2 ? '保存成功' : '归档成功',
        icon: 'none',
      });
      setTimeout(() => {
        Taro.navigateBack({ delta: 1 });
        const prePage = getPageInstance(-1);
        const uniqueId = prePage?.data?.uniqueId;
        prePage?.setData({
          from: 'archive_observation',
          uniqueId,
        });
      }, 1000);
    };
    saveOrUpdate(opts).then((res) => {
      if (res) {
        if (!observeId) {
          microAppTag({ dataId: uniqueId, tag: '已归档' }).then(onBack);
        } else onBack(2);
      }
    });
  };
  return <Archive {...state} type="observe" submit={onSubmit} isEdit={!!observeId} />;
};

export default ArchiveObservation;
