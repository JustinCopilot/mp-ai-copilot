import React, { useEffect, FC, useState, useRef } from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import { useReducer } from '@sub-edu-behavior/utils';
import classNames from 'classnames';
import cloneDeep from 'lodash/cloneDeep';
import Taro from '@tarojs/taro';
import 'taro-ui/dist/style/components/float-layout.scss';
import { removeSituationApi } from '@sub-edu-behavior/request';
import { AtFloatLayout } from 'taro-ui';
import { State, Props, Children, Option } from './config';
import './index.less';

export * from './config';

const initialState: State = {
  show: false,
  selectKeys: [],
  selectRows: [],
};

export const SelectLabelPicker: FC<Props> = ({
  title,
  type = 'multiple',
  isObserveSituation,
  maxLength = Number.MAX_SAFE_INTEGER,
  options,
  value = [],
  onChange,
  children,
}) => {
  const [state, dispatch] = useReducer<State>(initialState);
  const { show, selectRows, selectKeys } = state;
  const [copySelectRows, setCopySelectRows] = useState<Children[]>([]);
  const [copySelectKeys, setCopySelectKeys] = useState<(number | string)[]>([]);
  const [copyOptions, setCopyOptions] = useState<Option[]>([]);
  const situationIdsRef = useRef<number[]>([]);

  useEffect(() => {
    setCopyOptions(cloneDeep(options));
  }, [options, show]);
  useEffect(() => {
    if (show) {
      setCopySelectRows(cloneDeep(selectRows));
      setCopySelectKeys(cloneDeep(selectKeys));
    }
  }, [show]);

  useEffect(() => {
    if (options?.length > 0) {
      const rows = options?.reduce((p, c) => {
        const { children, value: val, label } = c || {};
        const list =
          children
            ?.filter((i) => value?.includes(i?.value) || value?.includes(i?.label))
            ?.map((i) => ({ ...i, parentLabel: label, parentValue: val })) || [];
        p?.push(...list);
        return p;
      }, [] as Children[]);

      dispatch('state', { selectRows: rows, selectKeys: value });
      onChange?.(value, rows);
    }
  }, [value, options]);
  const handleClose = () => {
    situationIdsRef.current = [];
    dispatch('show', false);
  };
  const cancelHandle = () => {
    dispatch('state', { selectRows: copySelectRows, selectKeys: copySelectKeys });
    handleClose();
  };
  const toggleHandle = ({
    val,
    label,
    subItem,
    isChecked,
    del,
  }: {
    val: string | number;
    label: string;
    subItem: Children;
    isChecked: boolean;
    del?: boolean;
  }) => {
    const list = cloneDeep(selectRows || []);
    if (del) {
      const lastOptionChidren = copyOptions[copyOptions.length - 1].children?.filter((item) => item.value !== val);
      setCopyOptions([
        ...copyOptions.slice(0, -1),
        { ...copyOptions[copyOptions.length - 1], children: lastOptionChidren },
      ]);
    }
    if (isChecked) {
      list.splice(
        list.findIndex(({ value }) => value === val),
        1,
      );
    } else if (!del) {
      // 多选
      if (type === 'multiple') {
        if (list?.length >= maxLength) return Taro.showToast({ title: `最多选择${maxLength}个`, icon: 'none' });
        list.push({ ...subItem, parentValue: value, parentLabel: label });
      } else {
        // 单选
        list.splice(0, list.length, subItem);
      }
    }
    dispatch('state', { selectRows: list, selectKeys: list.map(({ value }) => value) });
  };

  return (
    <View className="select-label-picker-wrap">
      <View className="select-label-picker" onClick={() => dispatch('show', true)}>
        {children}
      </View>
      <AtFloatLayout isOpened={show} className="select-label-picker-modal" onClose={cancelHandle}>
        {/* <PageContainer show={show} onClickOverlay={handleClose} zIndex={100} round={true}> */}
        <View className="observation-situation-modal">
          <View className="modal-title">
            <Text>{title}</Text>
            <Image
              src="https://senior.cos.clife.cn/xiao-c/icon-close-tag-selecter.png"
              className="modal-title-close "
              onClick={handleClose}
            />
          </View>
          <View className="situation-label">
            {copyOptions.map((item) => {
              const { value, label, children } = item;
              return (
                <View className="situation-label-item" key={value}>
                  <View className="situation-label-title">{label}</View>
                  <View className="situation-label-list">
                    {children?.map((subItem) => {
                      const { value: val, label: lab, allowDel, userId, situationId } = subItem || {};
                      const isChecked = selectKeys?.includes(val) || selectKeys?.includes(lab);
                      return (
                        <View
                          key={val}
                          className={classNames('situation-label-name', {
                            checked: isChecked,
                            allowDel: isObserveSituation && (allowDel || userId !== 0),
                          })}
                          onClick={() => toggleHandle({ val, label, subItem, isChecked })}
                        >
                          {lab}
                          <View
                            className="del"
                            onClick={(e) => {
                              // delHandle();
                              e.stopPropagation();
                              if (situationId) {
                                situationIdsRef.current.push(situationId);
                              }
                              toggleHandle({ val, label, subItem, isChecked, del: true });
                            }}
                          />
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </View>

          <View className="situation-btn">
            <Button className="footer-btn cancel-btn" onClick={cancelHandle}>
              取消
            </Button>
            <Button
              className="footer-btn confirm-btn"
              onClick={() => {
                const promises = situationIdsRef.current.map((situationId) => removeSituationApi({ situationId }));
                Promise.allSettled(promises).finally(() => {
                  onChange?.(selectKeys, selectRows, true);
                  handleClose();
                });
              }}
            >
              确定
            </Button>
          </View>
        </View>
        {/* </PageContainer> */}
      </AtFloatLayout>
    </View>
  );
};

export default SelectLabelPicker;
