const fs = require('fs-extra')
const path = require('path')

export default (ctx, options) => {
  ctx.onBuildFinish(async () => {

    // Taro v3.1.4
    const blended = ctx.runOpts.newBlended || ctx.runOpts.options.newBlended;
    if (!blended || !process.env.PACK_SUB_NAME) return;

    if (ctx.runOpts.config?.outputRoot.includes('sub-pag')) {
      await handleFixPagSubSource();
    }

    // 根路径
    const rootPath = path.resolve(__dirname, '../..')
    // 目标小程序路径
    const miniappPath = path.join(rootPath, 'miniapp')
    const miniappPath1 = path.join(rootPath, 'miniapp-taro/dist')
    // 要移动的资源路径
    const outputPath = path.resolve(__dirname, `../dist/xiao-c/${process.env.PACK_SUB_NAME}`)

    // @TODO: 异常文件夹处理
    if (fs.existsSync(`${outputPath}/Users`)) {
      fs.removeSync(`${outputPath}/Users`)
    }

    // 移动资源到哪个路径
    const destPath = path.join(miniappPath, `xiao-c/${process.env.PACK_SUB_NAME}`)
    const destPath1 = path.join(miniappPath1, `xiao-c/${process.env.PACK_SUB_NAME}`)

    // 目标路径资源移除
    if (fs.existsSync(destPath)) fs.removeSync(destPath)
    if (fs.existsSync(destPath1)) fs.removeSync(destPath1)
    // 开始拷贝
    fs.copySync(outputPath, destPath)
    fs.copySync(outputPath, destPath1)

    console.log('拷贝结束！')
  })
}

async function handleFixPagSubSource() {
  return new Promise(async (resolve, reject) => {
    try {
      // 根路径
      const rootPath = path.resolve(__dirname, '../..');
      // 要处理的资源路径
      const sourcePath = path.resolve(__dirname, '../dist/xiao-c/sub-pag');

      // 删除 sourcePath 下的所有非文件夹的文件
      const files = await fs.readdir(sourcePath);
      for (const file of files) {
        const filePath = path.join(sourcePath, file);
        const stats = await fs.stat(filePath);
        if (stats.isFile() && file !== 'app.json') {
          await fs.remove(filePath);
        }
      }

      // 删除 pagesPath 下的名为 'index' 的文件夹
      const pagesPath = path.join(sourcePath, 'pages');
      const indexFolder = path.join(pagesPath, 'index');
      if (await fs.pathExists(indexFolder)) {
        await fs.remove(indexFolder);
      }

      // 将 'index1' 文件夹重命名为 'index'
      const index1Folder = path.join(pagesPath, 'index1');
      if (await fs.pathExists(index1Folder)) {
        await fs.rename(index1Folder, indexFolder);
      }

      resolve();
    } catch (error) {
      reject(error);
    }
  });
}
