import React, { useEffect, useState } from 'react';
import { View } from '@tarojs/components';
import { getPageInstance } from '@plugin/utils';
import { EPageFrom } from '@plugin/types';
import Taro from '@tarojs/taro';
import { EEduBehaviorTag } from '@plugin/education/interface';
import Archive, { State } from '@plugin/education/components/archive';
import { TOP_BAR_HEIGHT } from '@plugin/constants';
import AlertModal from '@plugin/components/AlertModal';
import { AtNavBar } from 'taro-ui';
import 'taro-ui/dist/style/components/nav-bar.scss';
import 'taro-ui/dist/style/components/icon.scss';
import './index.less';
import { IUserParams } from '../jot_down_detail';

const InformationSupplement = () => {
  const [observationdetail, setObservationdetail] = useState<IUserParams>();
  const [isOpened, setIsOpened] = useState(false);

  const submitHandle = (data: State) => {
    const sectorList = data.sectorList.reduce((pre, cus) => {
      const index = pre.findIndex((item) => item.area === cus.parentLabel);
      if (index > -1) {
        pre[index].sub.push(cus.label);
      } else {
        pre.push({
          area: cus.parentLabel,
          sub: [cus.label],
        });
      }
      return pre;
    }, []);
    const params: IUserParams = {
      tag: EEduBehaviorTag.BehaviorMemoRewrite,
      resultType: '目标问题',
      observeId: observationdetail!.observeId,
      student: data.selectStudent as IUserParams['student'],
      extractInfo: {
        date: data.observeTime,
        input: data.observeContent,
        situationList: data.situationList.map((item) => item.label),
        photo: data.observePhoto,
        sectorList: sectorList as IUserParams['extractInfo']['sectorList'],
      },
    };
    console.log('params=', params);
    const prePage = getPageInstance(-1);
    prePage.setData({
      from: EPageFrom.EDIT_OBSERVATION,
      observationdetail: params,
    });
    Taro.navigateBack();
  };

  useEffect(() => {
    const prePage = getPageInstance(-1);
    const observationdetail = prePage.data.observationdetail;
    console.log('=observationdetail', observationdetail);
    setObservationdetail(observationdetail);
  }, []);

  return (
    <View className="information_supplement" style={{ paddingTop: TOP_BAR_HEIGHT }}>
      <AtNavBar border={false} leftIconType="chevron-left" color="#1E222F" onClickLeftIcon={() => setIsOpened(true)}>
        <View className="nav-bar-title">信息补充</View>
      </AtNavBar>
      {observationdetail && (
        <View className="edit-content">
          <Archive
            isEdit={true}
            type="notable"
            selectStudent={observationdetail.student}
            observeSituation={observationdetail.extractInfo.situationList || []}
            sectorValue={observationdetail.extractInfo.sectorList?.map((item) => item.sub).flat() || []}
            observeTime={observationdetail.extractInfo.date}
            observePhoto={observationdetail.extractInfo.photo}
            observeContent={observationdetail.extractInfo.input}
            showParentVisible={!!observationdetail.flag}
            submit={submitHandle}
          />
        </View>
      )}
      <AlertModal
        isOpened={isOpened}
        closeHandle={() => setIsOpened(false)}
        okHandle={() => {
          Taro.navigateBack();
        }}
        title="确认要退出编辑？"
        content="退出后编辑的内容将不会保存，确定要退出编辑吗？"
        cancelText="继续编辑"
        okText="退出"
      />
    </View>
  );
};

export default InformationSupplement;
