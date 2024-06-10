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
      root: "sub-packages-2/",
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
