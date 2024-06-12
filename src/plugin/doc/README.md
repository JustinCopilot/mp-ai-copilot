# aiPlugin

## 引入插件代码包

使用插件前，使用者要在 `app.json` 中声明需要使用的插件，例如：

**代码示例：**

```json
{
  "plugins": {
    "aiPlugin": {
      "version": "1.0.0", // 使用开发版插件以 dev-hash 的形式接入（hash由插件方提供）
      "provider": "wxidxxxxxxxxxxxxxxxx"
    }
  }
}
```

> 注：建议使用“分包+分包预下载”引入插件的方式以提高小程序启动速度，具体可参考 https://developers.weixin.qq.com/miniprogram/dev/framework/plugin/using.html

> 在开发版小程序中测试：https://developers.weixin.qq.com/miniprogram/dev/framework/plugin/development.html#%E5%9C%A8%E5%BC%80%E5%8F%91%E7%89%88%E5%B0%8F%E7%A8%8B%E5%BA%8F%E4%B8%AD%E6%B5%8B%E8%AF%95

## 使用插件

目前该插件只提供了页面功能

### 页面

需要跳转到插件页面时，`url` 使用 `plugin://` 前缀，形如 `plugin://PLUGIN_NAME/PLUGIN_PAGE`， 如：

**代码示例：**

```jsx
<Navigator url="plugin://aiPlugin/list">Go to pages/hello-page!</Navigator>
```

#### list页面

接收以下参数

| 参数名 | 类型   | 必填 | 说明                       |
| :----- | :----- | :--- | :------------------------- |
| env    | String | 是   | 当前环境（itest, prod）    |
| type   | Number | 是   | 事业部类型: 1.教育，2.美业 |
| mobile | String | 是   | 手机号                     |
| token  | String | 是   | 事业部小程序 token         |
