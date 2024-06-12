export interface State {
  show: boolean,
  selectRows: Children[],
  selectKeys: Option['value'][]
}
export interface Children extends Option {
  parentValue: string | number;
  parentLabel: string;
}
export interface Option {
  value: string | number;
  label: string;
  children?: Children[];
  disabled?: boolean;
  allowDel?: boolean;
}
export interface Props {
  /** 单选/多选 默认多选 */
  type?: 'single' | 'multiple'; // 单选多选
  /** 标题 */
  title: string,
  /** 最多可选数 */
  maxLength?: number,
  /** 选项 */
  options: Option[],
  /** 选中的值 */
  value?: Option['value'][],
  onChange?: (value: Option['value'][], selectRows: Children[]) => void,
  children?: React.ReactNode;
}