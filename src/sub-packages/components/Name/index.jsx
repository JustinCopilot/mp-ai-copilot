import { View, Text } from '@tarojs/components'
import './index.scss'

export default function (props) {

  return (
    <View className='index'>
      <Text className='blue'>sub-packages components Name：{props.name}</Text>
    </View>
  )
}
