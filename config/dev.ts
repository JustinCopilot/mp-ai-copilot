import type { UserConfigExport } from "@tarojs/cli";
export default {
  logger: {
    quiet: false,
    stats: true
  },
  env: {
    NODE_ENV: '"development"',
  },
  defineConstants: {},
  mini: {},
  h5: {
    esnextModules: ['taro-ui'],
    devServer: {
      host: 'localhost',
      port: 10086,
      proxy: [
        {
          context: ['/v1'],
          target: 'https://itest.clife.net', //域名
          // target: "https://dev.clife.net", //域名
          // target: "http://10.6.33.111:8085", //域名
          // pathRewrite: { "^/v1": "" },
          changeOrigin: true,
          secure: false,
        },
      ],
    },
  },
} satisfies UserConfigExport;
