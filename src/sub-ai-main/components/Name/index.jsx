import { View, Text, Image } from '@tarojs/components'
import './index.scss'
// import Png from './a.png'

export default function (props) {

  return (
    <View className='index'>
      <Text className='blue'>sub-ai-main components Name：{props.name}</Text>
      {/* <Image src={Png}></Image> */}
    </View>
  )
}
