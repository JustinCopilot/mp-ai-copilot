/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, FC, useMemo } from 'react';
import { View } from '@tarojs/components';
import { Children, SelectLabelPicker } from '@sub-edu-behavior/components/SelectLabelPicker';
import { CommonValue } from '@sub-edu-behavior/components/archive/observe-time';
import { getSectorListApi } from '@sub-edu-behavior/request';
import './index.less';
import { ChildProps } from '../config';
import ModuleTitle from '../module-title';

export const DomainLinked: FC<ChildProps> = ({ dispatch, state, type = 'notable' }) => {
  const [value, setValue] = useState<Children[]>([]);
  const { sectorOptions, sectorValue } = state || {};
  const valueStr = useMemo(() => {
    const parentValues = [...new Set(value?.map(({ parentValue }) => parentValue))];
    const valueStr = parentValues?.reduce((p, c) => {
      const parentLabel = value?.find(({ parentValue }) => parentValue === c)?.parentLabel;
      const childLabel = value
        ?.filter(({ parentValue }) => parentValue === c)
        ?.map(({ label }) => label)
        ?.join('、');
      const char = !p ? '' : ';';
      return `${p}${char}${parentLabel}-${childLabel}`;
    }, '');
    return valueStr;
  }, [value]);

  useEffect(() => {
    getOptions();
  }, []);
  const getOptions = async () => {
    const data = (await getSectorListApi()) || {};
    const options =
      data?.map(({ typeId, typeName, sectorList }) => ({
        label: typeName,
        value: typeId,
        children:
          sectorList?.map(({ sectorId: value, sectorName: label, ...rest }) => ({ value, label, ...rest })) || [],
      })) || [];
    dispatch('sectorOptions', options);
  };
  return (
    <View className="domain-linked-container">
      <ModuleTitle title="关联领域" />
      <SelectLabelPicker
        title="选择关联领域"
        maxLength={type === 'notable' ? 3 : undefined}
        options={sectorOptions}
        value={sectorValue}
        onChange={(val, rows) => {
          setValue(rows);
          dispatch('sectorValue', val);
          dispatch('sectorList', rows);
        }}
      >
        <CommonValue value={(valueStr as string) || '请选择'} holder={!valueStr} />
      </SelectLabelPicker>
    </View>
  );
};

export default DomainLinked;
