# `@xia18/check-es-syntax-plugin`

> 检查webpack打包之后的产物是否包含非ES5语法，支持sourceMap定位源码，避免第三方库由于打包配置等问题，存在不兼容es5环境下的语法，

## 使用 webpack.config.js

```javascript
const checkEsSyntaxPlugin = require('@xia18/check-es-syntax-plugin');
module.exports = {
  devtool: 'source-map',
  plugins: [new CheckPlugin({ ecmaVersion: 5 })],// 默认监测es5语法
}

```

## 效果
<p>
<img src="https://raw.githubusercontent.com/XiaMengjian/xia-public/main/packages/checkESSyntaxPlugin/imgs/errorMsg.png"/>
</p>