import path from 'path';
// import fs from 'fs';
import { defineConfig, type UserConfigExport } from '@tarojs/cli';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
// import CopyWebpackPlugin from 'copy-webpack-plugin';
import WxssImportPlugin from './WxssImportPlugin';
import devConfig from './dev';
import prodConfig from './prod';

// const outputDir = 'dist/xiao-c';
// if (!fs.existsSync(outputDir)) {
//   fs.mkdirSync(outputDir, { recursive: true });
// }

// https://taro-docs.jd.com/docs/next/config#defineconfig-辅助函数
const PackSubName = process.env.PACK_SUB_NAME;
export default defineConfig(async (merge, { command, mode }) => {
  const baseConfig: UserConfigExport = {
    projectName: 'mp-ai-helper',
    date: '2024-6-17',
    designWidth: 750,
    deviceRatio: {
      375: 2,
      640: 2.34 / 2,
      750: 1,
      828: 1.81 / 2,
    },
    sourceRoot: PackSubName ? `src/${PackSubName}` : 'src',
    outputRoot: PackSubName ? `dist/xiao-c/${PackSubName}` : 'dist',
    plugins: [
      'taro-plugin-compiler-optimization',
      path.join(process.cwd(), '/plugins/fix-taro-react-echarts.js'), // 修复 echarts 缺陷
      path.join(process.cwd(), '/plugins/move-dist-to-host-miniapp.js'), // 移动构建产物到宿主小程序
    ],
    copy: {
      patterns: [
        { from: 'src/sub-pag/utils', to: `dist${PackSubName ? '/xiao-c' : ''}/sub-pag/utils` },
        { from: 'src/sub-pag/native-pages/index', to: `dist${PackSubName ? '/xiao-c' : ''}/sub-pag/pages/index1` },
      ],
      options: {},
    },
    framework: 'react',
    compiler: {
      type: 'webpack5',
      prebundle: {
        enable: false,
      },
    },
    cache: {
      enable: false // Webpack 持久化缓存配置，建议开启。默认配置请参考：https://docs.taro.zone/docs/config-detail#cache
    },
    defineConstants: {},
    sass: {
      resource: path.resolve(__dirname, '..', 'src/common/assets/styles/sass-variables.scss'),
    },
    mini: {
      miniCssExtractPluginOption: {
        ignoreOrder: true
      },
      output: {
        chunkLoadingGlobal: `${PackSubName ? PackSubName.replace(/-/g, '') : ''}WebpackJsonp`,
      },
      postcss: {
        autoprefixer: {
          enable: true,
          config: {},
        },
        pxtransform: {
          enable: true,
          config: {},
        },
        url: {
          enable: true,
          config: {
            limit: 10240, // 设定转换尺寸上限
          },
        },
        cssModules: {
          enable: true, // 默认为 false，如需使用 css modules 功能，则设为 true
          config: {
            namingPattern: 'module', // 转换模式，取值为 global/module
            generateScopedName: '[name]__[local]___[hash:base64:5]',
          },
        },
      },
      webpackChain(chain) {
        chain.resolve.plugin('tsconfig-paths').use(TsconfigPathsPlugin)
      },
      optimizeMainPackage: {
        enable: true
      }
    },
    h5: {
      publicPath: '/',
      staticDirectory: 'static',
      output: {
        filename: 'js/[name].[hash:8].js',
        chunkFilename: 'js/[name].[chunkhash:8].js'
      },
      miniCssExtractPluginOption: {
        ignoreOrder: true,
        filename: 'css/[name].[hash].css',
        chunkFilename: 'css/[name].[chunkhash].css'
      },
      postcss: {
        autoprefixer: {
          enable: true,
          config: {},
        },
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
          config: {
            namingPattern: 'module', // 转换模式，取值为 global/module
            generateScopedName: '[name]__[local]___[hash:base64:5]',
          },
        },
      },
      webpackChain(chain) {
        chain.resolve.plugin('tsconfig-paths').use(TsconfigPathsPlugin)
      }
    },
    alias: {
      '@common': path.resolve(__dirname, '..', 'src/common'),
      '@assets': path.resolve(__dirname, '..', 'src/common/assets'),
      '@plugin': path.resolve(__dirname, '..', 'src/plugin'),
      '@sub-edu': path.resolve(__dirname, '..', 'src/sub-edu'),
      '@sub-pag': path.resolve(__dirname, '..', 'src/sub-pag'),
      '@pages': path.resolve(__dirname, '..', 'src/pages'),
      '@components': path.resolve(__dirname, '..', 'src/plugin/components'),
      '@hooks': path.resolve(__dirname, '..', 'src/plugin/hooks'),
    },
    plugin: {
      // 插件配置...
      webpackChain(chain) {
        chain.plugin('WxssImportPlugin').use(WxssImportPlugin);
        // chain.plugin('copyWebpackPlugin').use(CopyWebpackPlugin, [
        //   {
        //     patterns: [
        //       {
        //         from: 'node_modules/libpag-miniprogram/lib/',
        //         to: 'sub/utils/',
        //         globOptions: {
        //           ignore: ['**/*.map', '**/*.wasm', '**/*.js'],
        //         },
        //       },
        //     ],
        //   },
        // ]);
        // chain.plugin('analyzer').use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin, []);
      },
    },
  };

  if (process.env.NODE_ENV === 'development') {
    // 本地开发构建配置（不混淆压缩）
    return merge({}, baseConfig, devConfig)
  }
  // 生产构建配置（默认开启压缩混淆等）
  return merge({}, baseConfig, prodConfig)
})
