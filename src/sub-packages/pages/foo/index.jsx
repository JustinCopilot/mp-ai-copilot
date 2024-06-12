import { View, Text } from '@tarojs/components'
import './index.scss'
import Name from '../../../plugin/components/Name'

export default function () {

  return (
    <View className='index'>
      <View className='yellow'>sub-packages foo: <Text className='red'>red</Text></View>
      <View>引用其他分包的组件：</View>
      {
        [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21].map(i => (
          <Name name={`jeamn${i}`} key={i} />
        ))
      }
    </View>
  )
}
