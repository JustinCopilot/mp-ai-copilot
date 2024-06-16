
export interface State {
  show: boolean,
}
export interface Student {
  studentId: number;
  studentName: string;
  avatar?: string;
  sex?: number;
}
export interface Props {
  show?: boolean;
  onClose?: () => void;
  /** 选项 */
  studentList: Student[],
  /** 选中的值 */
  value?: Student['studentId'],
  onChange?: (value: Props['value'], selectRows: Student) => void,
  children?: React.ReactNode;
}