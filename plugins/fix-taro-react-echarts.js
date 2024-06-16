const fs = require('fs-extra');
const path = require('path');

export default (ctx) => {
  ctx.onBuildStart(() => {
    const rootPath = path.resolve(__dirname, '..');
    const taroLoaderPath = path.join(rootPath, 'node_modules/taro-react-echarts/dist/index.esm.js');
    if (fs.existsSync(taroLoaderPath)) {
      fs.readFile(taroLoaderPath, 'utf8', (err, data) => {
        if (err) {
          console.error('读取文件失败:', err);
          return;
        }
        if (data.includes('.select')) {
          if (data.includes('.in(Taro.getCurrentInstance().page).select')) {
            return
          }
          const modifiedData = data.replace(
            `.select`,
            `.in(Taro.getCurrentInstance().page).select`,
          );
          fs.writeFile(taroLoaderPath, modifiedData, 'utf8', (err) => {
            if (err) {
              console.error('写入文件失败:', err);
              return;
            }
            console.log('文件修改完成');
          });
        }
      });
    }
  });
};
