export default defineAppConfig({
  pages: [
    'pages/index/index'
  ],
  subPackages: [
    {
      root: "sub-packages/",
      pages: [
        "pages/bar/index",
        "pages/foo/index"
      ]
    },
    {
      root: "sub-ai-common/",
      pages: [
        "pages/bar/index",
        "pages/foo/index"
      ]
    }
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black'
  }
})
