import { View, Text, Image } from '@tarojs/components'
import './index.scss'
import Png from './a.png'

export default function (props) {

  return (
    <View className='index'>
      <Text className='blue'>sub-packages-2 components Name：{props.name}</Text>
      <Image src={Png}></Image>
    </View>
  )
}
