import { generateUUID } from '@common/utils';

export function getChatList(len: number) {
  const res = Array.from(
    {
      length: len,
    },
    (_, index) => {
      const uuid = generateUUID();
      const isAi = index % 2 === 0;
      return {
        agentRole: null,
        updateDate: null,
        timeLong: 0,
        sopId: index,
        stateId: 0,
        agentName: null,
        chatTime: '2024-03-11 16:39:50',
        exeId: 0,
        sessionId: '8e41467a-6a45-42f3-afb7-e430c5898108-19-65',
        chatContent: isAi
          ? '小二班的饮水情况小二班的饮水情况小二班的饮水情况小二班的饮水情况小二班的饮水情况'
          : '小二班的饮水情况',
        userId: 19,
        chatUser: isAi ? 2 : 1,
        saasAppId: 46,
        sopVersionID: 0,
        stateName: null,
        ssdId: 21517,
        sopName: null,
        createDate: null,
        like: null,
        reason: null,
        uniqueId: uuid,
        labels: null,
        labelList: [
          '测试对话测试对话1',
          '测试对话测试对话22',
          '测试对话测试对话测试对话333测试对话测试对话测试对话333测试对话测试对话测试对话333测试对话测试对话测试对话333测试对话测试对话测试对话333',
        ],
        agentResponse: null,
        componentUserInPutParam: null,
        ui: null,
      };
    },
  );
  return res;
}
