import Taro from '@tarojs/taro';

export const TOP_BAR_HEIGHT = Taro.getWindowInfo().statusBarHeight;

export const MENU_BUTTON_INFO = Taro.getMenuButtonBoundingClientRect();

export const PRE_PLUGIN_PATH = '/plugin/pages';

export const DEFAULT_AVATAR_BOY = 'https://senior.cos.clife.cn/xiao-c/F7255E06-FED3-4F0F-AFED-FB3B451C3192.png';
export const DEFAULT_AVATAR_GIRL = 'https://senior.cos.clife.cn/xiao-c/56D74B9A-198D-4C2B-9557-9FA526F6D62D.png';

export const CHAT_TIMEOUT = 30000;
