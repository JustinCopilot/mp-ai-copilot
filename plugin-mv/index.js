const fs = require('fs-extra')
const path = require('path')

export default (ctx, options) => {
  ctx.onBuildFinish(() => {

    // Taro v3.1.4
    const blended = ctx.runOpts.newBlended || ctx.runOpts.options.newBlended
    if (!blended || !process.env.PACK_MODE) return

    console.log('编译结束！')

    // 根路径
    const rootPath = path.resolve(__dirname, '../..')
    // 目标小程序路径
    const miniappPath = path.join(rootPath, 'miniapp')
    const miniappPath1 = path.join(rootPath, 'miniapp-taro/dist')
    // 要移动的资源路径
    const outputPath = path.resolve(__dirname, `../dist/xiao-c/${process.env.PACK_MODE}`)

    // @TODO: 异常文件夹处理
    if (fs.existsSync(`${outputPath}/Users`)) {
      fs.removeSync(`${outputPath}/Users`)
    }

    // 移动资源到哪个路径
    const destPath = path.join(miniappPath, `xiao-c/${process.env.PACK_MODE}`)
    const destPath1 = path.join(miniappPath1, `xiao-c/${process.env.PACK_MODE}`)

    // 目标路径资源移除
    if (fs.existsSync(destPath)) fs.removeSync(destPath)
    if (fs.existsSync(destPath1)) fs.removeSync(destPath1)
    // 开始拷贝
    fs.copySync(outputPath, destPath)
    fs.copySync(outputPath, destPath1)

    console.log('拷贝结束！')
  })
}
