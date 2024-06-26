export const TagGroups = [
  {
    title: '用户性格',
    tags: [
      '内向',
      '外向',
      '理智',
      '情感',
      '感性',
      '完美主义',
      '直率',
      '急躁',
      '耐心',
      '悲观',
      '积极',
      '乐观',
      '含蓄',
      '热情',
      '保守',
      '自信',
      '细心',
    ],
  },
  {
    title: '防晒习惯',
    tags: ['注重防晒', '常规防晒', '间歇性防晒', '不重视防晒', '日常防晒霜', '日常遮阳帽防晒'],
  },
  {
    title: '清洁习惯',
    tags: ['深层洁面', '早晚洁面', '温和洁面', '周期去角质', '简便洁面', '规律洁面', '双重洁面'],
  },
  {
    title: '护肤偏好',
    tags: [
      '精简护肤',
      '科技护肤',
      '抗衰保养',
      '保湿滋润',
      '敏感肌护理',
      '药妆用户',
      '成分达人',
      '护肤品牌粉丝',
      '绿色护肤',
      '美白淡斑',
      '新品尝鲜护肤',
      '口碑追随护肤',
      '天然成分护肤爱好',
      '跟风护肤',
    ],
  },
  {
    title: '睡眠偏好',
    tags: [
      '早睡早起',
      '晚睡晚起',
      '午睡爱好者',
      '深度睡眠',
      '多梦',
      '易醒',
      '固定作息者',
      '经常失眠',
      '睡眠浅',
      '夜猫子',
      '早起者',
      '长时间睡眠者',
      '短时睡眠者',
      '周末补觉者',
      '自然醒',
    ],
  },
  {
    title: '饮食偏好',
    tags: [
      '健康饮食',
      '海鲜控',
      '素食主义',
      '重口味饮食',
      '爱好甜食',
      '高蛋白饮食',
      '肉食主义',
      '低脂饮食',
      '低碳水饮食',
      '有机饮食',
      '饮食清淡',
      '生酮饮食',
      '无糖饮食',
      '低盐饮食',
      '定时定量饮食',
      '暴饮暴食',
      '轻断食',
      '辟谷爱好',
      '喜欢饮茶',
      '咖啡爱好者',
      '低热饮食',
      '饮食规律',
      '荤素搭配',
      '营养均衡饮食',
    ],
  },
  {
    title: '吸烟行为',
    tags: ['重度吸烟者', '偶尔吸烟者', '不吸烟', '社交吸烟者', '老烟民', '戒烟者', '电子烟用户', '雪茄爱好者'],
  },
  {
    title: '饮酒行为',
    tags: ['经常饮酒', '偶尔饮酒', '不饮酒', '酗酒', '爱喝白酒', '爱喝啤酒', '爱喝红酒'],
  },
  {
    title: '肤质类型',
    tags: ['油性肤质', '混合性偏油肤质', '混合性肤质', '混合性偏干肤质', '中性肤质', '干性肤质', '敏感性肤质'],
  },
];

function convertTagGroupsToDict(tagGroups) {
  const result = {};

  for (const group of tagGroups) {
    const { title, tags } = group;
    result[title] = tags;
  }

  return result;
}

export const TagDict = convertTagGroupsToDict(TagGroups);
