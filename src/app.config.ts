export default defineAppConfig({
  pages: [
    'pages/index/index'
  ],
  subPackages: [
    // AI通用组件分包
    {
      root: "sub-ai-common/",
      pages: [
        "pages/bar/index",
        "pages/foo/index"
      ]
    },
    // 测试独立分包
    {
      root: "sub-packages/",
      pages: [
        "pages/bar/index",
        "pages/foo/index"
      ]
    },
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black'
  }
})
