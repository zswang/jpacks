# [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coverage Status][coverage-image]][coverage-url]

# jpacks

Binary data packing and unpacking.

jpacks 一款强大的二进制结构编解码工具

支持复杂的结构：

e.g.

```js
// 定义结构
jpacks.def('User', {
  age: 'uint8',
  token: jpacks.array('byte', 10),
  name: jpacks.shortString,
  note: jpacks.longString,
  contacts: jpacks.shortArray('User')
});

var user = {
  age: 6,
  token: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  name: 'ss',
  note: '你好世界！Hello World!',
  contacts: [{
    age: 10,
    token: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    name: 'nn',
    note: '风一样的孩子!The wind of the children!',
    contacts: [{
      age: 12,
      token: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      name: 'zz',
      note: '圣斗士星矢！Saint Seiya！',
      contacts: []
    }]
  }, {
    age: 8,
    token: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    name: 'cc',
    note: '快乐的小熊！Happy bear！',
    contacts: []
  }]
};

// 组包
var buffer = jpacks.pack('User', user);

// 解包
var user2 = jpacks.unpack('User', buffer);

console.log(JSON.stringify(user2, null, '  '));
```

## Features 功能性

+ Supports running in NodeJS and Browser. 支持运行在 NodeJS 和浏览器环境。
+ Can be nested definition. 支持嵌套定义。
+ Commonly used numerical types, including signed and unsigned. 常用的数值类型，包括有符号和无符号。
+ Supports array types, including fixed length or indefinite. 支持数组类型，包括定长或不定长。
+ Int64. 大整数处理。
+ Protocol Buffers. 支持处理 PB 协议。
+ Data compression and decompression. 数据压缩和解压。

## Dependencies 依赖

+ [protobufjs](https://github.com/dcodeIO/protobuf.js)
+ [long](https://github.com/dcodeIO/long.js)

## License 许可协议

MIT © [zswang](http://weibo.com/zswang)

[npm-url]: https://npmjs.org/package/jpacks
[npm-image]: https://badge.fury.io/js/jpacks.svg
[travis-url]: https://travis-ci.org/zswang/jpacks
[travis-image]: https://travis-ci.org/zswang/jpacks.svg?branch=master
[coverage-url]: https://coveralls.io/github/zswang/jpacks?branch=master
[coverage-image]: https://coveralls.io/repos/zswang/jpacks/badge.svg?branch=master&service=github
