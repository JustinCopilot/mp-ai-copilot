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
      <Navigator url='/taro/pages/list/index'>测试跳转独立分包页面</Navigator>
    </View>
  )
}
