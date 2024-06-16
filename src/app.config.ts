export const pluginPages = [
  "pages/list/list",
  "pages/chat/chat",
  "pages/chat_extension/index",
  "pages/synthesis/synthesis",
  "pages/share_img/share_img",
  "pages/img_list/img_list",
  "pages/redirect/redirect",
]

export const eduBehaviorPages = [
  "pages/my_archive/index",
  "pages/jot_down_reference_detail/index",
  "pages/data_reference_detail/index",
  "pages/choose_child/index",
  "pages/jot_down_detail/index",
  "pages/archive_observation/index",
  "pages/information_supplement/index",
  "pages/observation_detail/index"
]

export default defineAppConfig({
  pages: [
    'pages/index/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black'
  },
  subPackages: [
    // AI主流程分包
    {
      root: "plugin/",
      pages: [
        ...pluginPages,
      ],
    },
    // 幼教行为观察分包
    {
      root: "sub-edu-behavior/",
      pages: [
        ...eduBehaviorPages,
      ],
    },
    // 动效组件分包
    {
      root: "sub-pag/",
      pages: [
        "pages/index",
      ],
    },
  ],
  plugins: {
    WechatSI: {
      version: '0.3.5',
      provider: 'wx069ba97219f66d99',
    },
    QCloudAIVoice: {
      version: '2.3.1',
      provider: 'wx3e17776051baf153',
    },
  },
})
