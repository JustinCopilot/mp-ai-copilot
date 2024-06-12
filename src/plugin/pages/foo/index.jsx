import { View, Text } from '@tarojs/components'
import './index.scss'

export default function () {

  return (
    <View className='index'>
      <Text className='yellow'>plugin foo: <Text className='red'>red</Text></Text>
    </View>
  )
}
