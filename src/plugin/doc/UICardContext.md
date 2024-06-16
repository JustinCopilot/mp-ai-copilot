#### IUICardContext

| 属性                        | 说明                                                                                                    | 类型                                                            | 说明                                                                                                                                                                     |
| --------------------------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| chatItem                    | 每条对话对象，两种数据来源集合：<br />1. chat 对话接口返回的流式数据<br />2. history 接口返回的历史记录 | IChatItem                                                       | origin字段为原始数据<br />UI所需字段要跟后端/算法对齐                                                                                                                    |
| isGlobalPlaying             | 是否在语音播报中                                                                                        | boolean                                                         |                                                                                                                                                                          |
| isGlobalLastAnswer          | 是否是最后一条回答对话                                                                                  | boolean                                                         |                                                                                                                                                                          |
| globalAnswerStatus          | 对话回复状态                                                                                            | number                                                          | 0：未提问状态<br />1：等待回复中<br />2：回复中                                                                                                                          |
| globalCheckStatus           | 对话确认状态                                                                                            | number                                                          | 0：非确认状态<br />1：待确认状态<br />2：开启新会话状态                                                                                                                  |
| changeCurrentChatItemTag    | 设置当前回答条tag                                                                                       | (chatItemTag: EChatItemTag) => void                             |                                                                                                                                                                          |
| changeCurrentAnswerOperater | 设置当前回答条操作项                                                                                    | (config: IAnswerOperaterConfig)=>void                           |                                                                                                                                                                          |
| changeCurrentCopyText       | 设置当前回答条复制文案                                                                                  | (text: string)=>void                                            | 默认值：chatItem.chatContent                                                                                                                                             |
| changeCurrentPlayContent    | 设置当前回答条语音播报文案                                                                              | (text: string)=>void                                            | 默认值：chatItem.chatContent                                                                                                                                             |
| putChat                     | 发起 chat 接口提问                                                                                      | (params: IGetAnswerResultParams, extra?: IExtraConfig) => void; | interface IGetAnswerResultParams extends Omit<IPutChatReq, 'microAppUuid'> { }<br />IPutChatReq参数详情可参考后端接口文档                                                |
| saveChatItem                | 发起 chat 接口保存自定义数据                                                                            | (params: IGetAnswerResultParams) => void;                       | interface IGetAnswerResultParams extends Omit<IPutChatReq, 'microAppUuid'> { }<br />IPutChatReq参数详情可参考后端接口文档<br />**注：涉及自定义字段内容需要跟APP端对齐** |

#### IAnswerOperaterConfig

| 属性               | 说明           | 类型    |
| ------------------ | -------------- | ------- |
| hideAnswerOperater | 隐藏回复操作条 | boolean |
| hideVoicePlay      | 隐藏语音播报   | boolean |
| hideFeedback       | 隐藏点赞点踩   | boolean |
| hideReGenerator    | 隐藏重新生成   | boolean |

#### IExtraConfig

| 属性          | 说明                                           | 类型    |
| ------------- | ---------------------------------------------- | ------- |
| needPutAnsker | 是否需要往对话列表中添加问题对话（仅前端生效） | boolean |
