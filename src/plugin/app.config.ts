
import { pluginPages } from '../app.config';

export default defineAppConfig({
  pages: [
    ...pluginPages,
  ],
  components: [
    'components/Enter/Enter',
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
