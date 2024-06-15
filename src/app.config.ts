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
    // AI通用组件分包
    {
      root: "plugin/",
      pages: [
        "pages/list/index",
        "pages/chat/index",
        "pages/chat_extension/index",

        // @TODO: 行为观察抽离单独分包
        "education/pages/my_archive/index",
        "education/pages/jot_down_reference_detail/index",
        "education/pages/data_reference_detail/index",
        "education/pages/choose_child/index",
        "education/pages/jot_down_detail/index",
        "education/pages/archive_observation/index",
        "education/pages/information_supplement/index",
        "education/pages/observation_detail/index"
      ],
    },
    // 测试独立分包
    {
      root: "sub-packages/",
      pages: [
        "pages/bar/index",
        "pages/foo/index"
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
