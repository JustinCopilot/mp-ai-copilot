import { View, Text } from '@tarojs/components'
import './index.scss'

export default function () {

  return (
    <View className='index'>
      <View className='blue'>sub-packages bar 页面: <Text className='red'>red</Text></View>
      <View>引用自身分包的组件：</View>
    </View>
  )
}
