// 当前会话技能
export enum EEduBehaviorTag {
  BehaviorMemoRewrite = 'BehaviorMemoRewrite', // 执行”随手记-我的归档（编辑随手记功能）“模块
  BehaviorRecord = 'BehaviorRecord', // 执行”生成观察记录“模块
  BehaviorKeyPoint = 'BehaviorKeyPoint', // 执行”观察要点“模块
  BehaviorAnalysisSuggestion = 'BehaviorAnalysisSuggestion', // 执行”观察分析建议“模块
  BehaviorMemo = 'BehaviorMemo', // 执行”随手记“模块
}

// 行为观察聊天卡片
export enum EEduBehaviorChatCard {
  IntelligentInfoExtraction = 'IntelligentInfoExtraction', // 智能信息提取卡片
  DuplicateNameConfirm = 'DuplicateNameConfirm', // 重名幼儿确认
  GenerateObservationRecords = 'GenerateObservationRecords', // 生成观察记录
  ObservationPoints = 'ObservationPoints', // 观察要点
  ObservationRecord = 'ObservationRecord', // 观察记录
}

// 智能体名称
export enum EEduAgentName {
  MEMO = '随手记',
  BEHAVIOR = '生成观察记录',
  BEHAVIOR_RECORD_JSON = 'BehaviorRecord-json',
}

// 回复结果类型
export enum EResultType {
  NO_PERMISSION = '无权限查询提及的幼儿',
  IRRELEVANT = '无关问题',
  TARGET = '目标问题',
}
