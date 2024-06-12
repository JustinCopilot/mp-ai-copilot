import { Option } from '@edu/components/SelectLabelPicker';

export enum DataType {
  notable = 1,
  observe,
}

export interface Student {
  studentId: number;
  studentName: string;
  avatar?: string;
  birthday?: string;
  sex?: number;
}
export interface Class {
  classId?: number;
  className: string;
  gradeId?: number;
  gradeName?: string;
  studentList?: Student[];
}
export interface Grade {
  gradeId?: number;
  gradeName?: string;
  classList: Class[];
}
export interface State {
  /** 年级列表 */
  gradeList: Grade[];
  /** 添加学生弹窗 */
  childModal: boolean;
  /** 幼儿行为选择幼儿弹窗 */
  childModal2: boolean;
  /** 幼儿行为选择领域弹窗 */
  behaviorModal: boolean;
  /** 幼儿行为选择级别弹窗 */
  behaviorModal2: boolean;
  /** 选中的班级 */
  selectClass: Class['classId'];
  /** 选中的学生 */
  selectStudent: Student[];
  studentList: Array<{
    studentId: number;
    behaviorId?: string;
    behaviorName?: string;
    evaluate?: string;
  }>
  /** 全部的学生 随手记使用 */
  allStudents: Student[];
  /** 观察时间 */
  observeTime: string;
  /** 是否展示家长可见按钮 */
  showParentVisible: boolean;
  /** 家长可见 */
  parentVisible: boolean;
  /** 观察内容 */
  observeContent: string;
  /** 观察分析 */
  observeAnalysis: string;
  /** 观察跟进措施 */
  observeFollow: string;
  /** 观察照片 */
  observePhoto: {
    /** AI图片 */
    aiImgUrl?: string;
    /** 普通图片 */
    imgUrl?: string;
    /** 视频封面 */
    videoCoverUrl?: string;
    /** 视频地址 */
    videoUrl?: string;
  };
  /** 观察情境选项 */
  observeOptions: Option[];
  /** 选择的观察情境 */
  observeSituation: Option['value'][];
  /** 关联领域选项 */
  sectorOptions: Option[];
  /** 选择的关联领域 */
  sectorValue: Option['value'][];
  /** 幼儿行为当前选择的幼儿 */
  currentStudent?: Student;
  currentSector?: any;
  currentBehavior?: any;
  currentBehaviorLevel?: any;
  /** 编辑行为时缓存的数据 */
  cSector?: any;
  cBehavior?: any;
  cBehaviorLevel?: any;
  /* 选择的观察情境原始数据 */
  situationList: Common[];
  /* 选择的关联领域原始数据 */
  sectorList: Common[];
  /** 编辑/删除弹框 */
  delEditModal: boolean;
  /** 删除二次确认框 */
  delModal: boolean;
  isEdit?: boolean;
}

export interface Props {
  /** 页面类型 随手记:notable  观察记录: observe */
  type?: 'notable' | 'observe';
  /** 幼儿列表 */
  selectStudent: Student[];
  /** 观察情境 */
  observeSituation: Option['value'][];
  /** 关联领域 */
  sectorValue: Option['value'][];
  /** 观察时间 */
  observeTime: string;
  /** 家长可见 */
  parentVisible?: boolean;
  /** 观察内容 */
  observeContent: string;
  /** 观察分析 */
  observeAnalysis?: string;
  /** 观察跟进措施 */
  observeFollow?: string;
  /** 观察照片 */
  observePhoto: {
    /** AI图片 */
    aiImgUrl?: string;
    /** 普通图片 */
    imgUrl?: string;
    /** 视频封面 */
    videoCoverUrl?: string;
    /** 视频地址 */
    videoUrl?: string;
  };
  /** 是否为编辑 */
  isEdit?: boolean;
  /** 是否展示家长可见按钮 */
  showParentVisible: boolean;
  submit: (
    data: Partial<Omit<State, 'gradeList' | 'childModal' | 'selectClass' | 'sectorOptions' | 'observeOptions' | 'selectStudent'>>,
  ) => void;
}
export interface ChildProps extends Props {
  state: State;
  dispatch: any;
}
