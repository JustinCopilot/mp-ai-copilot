import { View, Navigator } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.less'

export default function Index() {

  useLoad(() => {
    console.log('Page loaded.')
  })

  return (
    <View className='index'>
      <View>Hello world!</View>
      <Navigator url='/sub-packages/pages/foo/index'>测试跳转sub-packages独立分包foo页面</Navigator>
      <Navigator url='/sub-packages/pages/bar/index'>测试跳转sub-packages独立分包bar页面</Navigator>
      <Navigator url='/sub-ai-main/pages/foo/index'>测试跳转sub-ai-main独立分包foo页面</Navigator>
      <Navigator url='/sub-ai-main/pages/bar/index'>测试跳转sub-ai-main独立分包bar页面</Navigator>
    </View>
  )
}
