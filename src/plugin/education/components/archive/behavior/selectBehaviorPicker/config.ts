
export interface Props {
  show?: boolean;
  onClose?: () => void;
  /** 选中的值 */
  onChange?: (selectRows: any) => void,
}