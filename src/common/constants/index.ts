import Taro from '@tarojs/taro';

export const TOP_BAR_HEIGHT = Taro.getWindowInfo().statusBarHeight;

export const MENU_BUTTON_INFO = Taro.getMenuButtonBoundingClientRect();

const PRE_PATH = process.env.TARO_APP_PACK_INDEPENDENT_SUB ? '/xiao-c' : '';
export const PRE_PLUGIN_PATH = `${PRE_PATH}/plugin/pages`;
export const PRE_EDU_PATH = `${PRE_PATH}/sub-edu/pages`;
