# [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coverage Status][coverage-image]][coverage-url]

# jints


Javascript Big Integer

jints 一个处理大整数的工具，支持各种进制间的转换

e.g.

+ input:

```js
console.log(jints.digit('1024', 10, 2)); // '10000000000'
console.log(jints.digit('10000000000', 2, 10)); // '1024'
```

![img](https://cloud.githubusercontent.com/assets/536587/10779484/70ba9faa-7d6c-11e5-925d-69651c3bbdb1.png)

## License

MIT © [zswang](http://weibo.com/zswang)

[npm-url]: https://npmjs.org/package/jints
[npm-image]: https://badge.fury.io/js/jints.svg
[travis-url]: https://travis-ci.org/zswang/jints
[travis-image]: https://travis-ci.org/zswang/jints.svg?branch=master
[coverage-url]: https://coveralls.io/github/zswang/jints?branch=master
[coverage-image]: https://coveralls.io/repos/zswang/jints/badge.svg?branch=master&service=github
