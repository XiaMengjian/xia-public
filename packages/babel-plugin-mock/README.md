# `@xia18/babel-plugin-mock`

> 实现module层面的mock,采用注释的方式，减少代码的侵入性

## 如何使用
babel.config.js

```javascript
const babelPluginMock = require('@xia18/babel-plugin-mock');
const path = require('path');

  plugins: [
    [
      babelPluginMock,
      {
        mockPath: path.join(__dirname, './plugin/mock.js'), // 替换数据的module.js路径
        mode: 'replace' // 分为replace 和 assign模式
      }
    ]
  ]
```

### 形式
```javascript
格式：
['需要mock的源数据']
['需要mock的源数据']:['mock中的替换数据']

// getLogin,getTest:getName
import { getLogin, getTest as aaa } from '@xia/native'
```

## 原理
```javascript
// getTest:getTestAlaisName
// getLogin
import { getLogin, getTest as aaa } from '@xia/native'

class B {
  bb() {
    getLogin()
    aaa()
    return 'bbb'
  }
}

const d = function () {
  function getLogin() {}
  console.log('ddd')
  getLogin().then()
}

const f = function () {
  console.log('getLogin')
  const test = getLogin('222').then()
}

```

### transformCode
#### mode: replace模式
```javascript
import { getLogin as _getLogin, getTestAlaisName as _getTestAlaisName } from "xxx/xx/plugin/mock.js";

class B {
  bb() {
    _getLogin();

    _getTestAlaisName();

    return 'bbb';
  }

}

const d = function () {
  function getLogin() {}

  console.log('ddd');
  getLogin().then();
};

const f = function () {
  console.log('getLogin');

  const test = _getLogin('222').then();
};

```

#### mode: assign模式
```javascript
import { getLogin as _assignGetLogin, getTestAlaisName as _assignGetTestAlaisName } from "xxx/xx/plugin/mock.js";
import { getLogin, getTest as aaa } from '@xia/native';

class B {
  bb() {
    _assignGetLogin(getLogin());

    _assignGetTestAlaisName(aaa());

    return 'bbb';
  }

}

const d = function () {
  function getLogin() {}

  console.log('ddd');
  getLogin().then();
};

const f = function () {
  console.log('getLogin');

  const test = _assignGetLogin(getLogin('222')).then();
};

```