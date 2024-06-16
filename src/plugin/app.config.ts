
import { eduBehaviorPages, pluginPages } from '../app.config';

export default defineAppConfig({
  pages: [
    ...pluginPages,
    ...eduBehaviorPages, // @TODO: 行为观察抽离单独分包
  ],
  plugins: {
    WechatSI: {
      version: '0.3.5',
      provider: 'wx069ba97219f66d99',
    },
    QCloudAIVoice: {
      version: '2.3.1',
      provider: 'wx3e17776051baf153',
    },
  },
})
