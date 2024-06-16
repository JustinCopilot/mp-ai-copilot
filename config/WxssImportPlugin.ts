import { ConcatSource } from 'webpack-sources';
const Regexp = /(?<=(plugin|sub-edu-behavior)\/(components|pages\/pages))\/.+\.wxss/g;
class WxssImportPlugin {
  apply(compiler) {
    compiler.hooks.emit.tapAsync('WxssImportPlugin', (compilation, callback) => {
      for (let [name, assets] of Object.entries(compilation.assets)) {
        if (Regexp.test(name)) {
          const times = name.split('/').length - 2;
          const firstLine = `@import '${Array(times).fill('../').join('') + 'common.wxss'}';\r\n`;
          compilation.assets[name] = new ConcatSource(firstLine + assets.source());
        }
      }
      callback();
    });
  }
}
export default WxssImportPlugin;
