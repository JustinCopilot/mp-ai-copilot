const fs = require('fs-extra')
const path = require('path')

export default (ctx, options) => {
  ctx.onBuildFinish(() => {

    // Taro v3.1.4
    // const blended = ctx.runOpts.blended || ctx.runOpts.options.blended
    // if (!blended) return

    console.log('编译结束！')

    const rootPath = path.resolve(__dirname, '../..')
    const miniappPath = path.join(rootPath, 'miniapp')
    const outputPath = path.resolve(__dirname, '../dist')
    const destPath = path.join(miniappPath, 'xiao-c')

    if (fs.existsSync(destPath)) {
      fs.removeSync(destPath)
    }
    fs.copySync(outputPath, destPath)

    const miniappPath1 = path.join(rootPath, 'miniapp-taro/dist')
    const destPath1 = path.join(miniappPath1, 'xiao-c')

    if (fs.existsSync(destPath1)) {
      fs.removeSync(destPath1)
    }
    fs.copySync(outputPath, destPath1)

    console.log('拷贝结束！')
  })
}
