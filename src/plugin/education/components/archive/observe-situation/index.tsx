/* eslint-disable max-nested-callbacks */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, FC, useMemo } from 'react';
import { View } from '@tarojs/components';
import { Option, SelectLabelPicker } from '@edu/components';
import { CommonValue } from '@edu/components/archive/observe-time';
import { getSituationLabelList } from '@edu/request/';
import cloneDeep from 'lodash/cloneDeep';

import './index.less';
import { ChildProps } from '../config';
import ModuleTitle from '../module-title';

/** 观察情境 */
export const ObserveSituation: FC<ChildProps> = ({ dispatch, state, type = 'notable' }) => {
  const { observeOptions, observeSituation } = state || {};
  const [value, setValue] = useState<Option[]>([]);
  const valueStr = useMemo(() => value?.map(({ label }) => label)?.join('、'), [value]);

  const options = useMemo(() => {
    let copyOptions = cloneDeep(observeOptions);
    if (
      !observeSituation?.some((key) =>
        copyOptions?.some((i) => i?.children?.some((j) => j?.value === key || j?.label === key)),
      )
    ) {
      copyOptions = copyOptions?.map((item) => {
        if (!['其他', '其它'].includes(item?.label)) return item;
        const children = [
          ...(item?.children || []),
          ...(observeSituation
            // eslint-disable-next-line max-nested-callbacks
            ?.filter((k) => !item?.children?.some((i) => i?.label === k || i?.value === k))
            ?.map((k) => ({
              label: k as string,
              value: k as number,
              allowDel: true,
            })) || []),
        ];
        return {
          ...item,
          children,
        };
      });
    }
    return copyOptions;
  }, [observeOptions, observeSituation]);

  useEffect(() => {
    getOptions();
  }, []);
  const getOptions = async () => {
    const data = (await getSituationLabelList()) || {};
    let options =
      data?.map(({ typeId, typeName, situationList }) => ({
        label: typeName,
        value: typeId,
        children: situationList?.map(({ situationId: value, situationName: label }) => ({ value, label })) || [],
      })) || [];
    dispatch('observeOptions', options);
  };
  return (
    <View className="observe-situation-container">
      <ModuleTitle title="观察情境" />
      <SelectLabelPicker
        title="选择观察情境"
        maxLength={type === 'notable' ? 3 : undefined}
        options={options}
        value={observeSituation}
        onChange={(val, rows) => {
          setValue(rows);
          dispatch('observeSituation', val);
          dispatch('situationList', rows);
        }}
      >
        <CommonValue value={valueStr || '请选择'} holder={!valueStr} />
      </SelectLabelPicker>
    </View>
  );
};

export default ObserveSituation;