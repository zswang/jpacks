(function (exportName) {
  /**
   * @file jpacks
   *
   * Binary data packing and unpacking.
   * @author
   *   zswang (http://weibo.com/zswang)
   * @version 0.0.1
   * @date 2015-10-30
   */
  var exports = {};
  /**
   * 对字符串进行 utf8 编码
   *
   * param {string} str 原始字符串
   */
  function encodeUTF8(str) {
    return String(str).replace(
      /[\u0080-\u07ff]/g,
      function (c) {
        var cc = c.charCodeAt(0);
        return String.fromCharCode(0xc0 | cc >> 6, 0x80 | cc & 0x3f);
      }
    ).replace(
      /[\u0800-\uffff]/g,
      function (c) {
        var cc = c.charCodeAt(0);
        return String.fromCharCode(0xe0 | cc >> 12, 0x80 | cc >> 6 & 0x3f, 0x80 | cc & 0x3f);
      }
    );
  }
  /**
   * 对 utf8 字符串进行解码
   *
   * @param {string} str 编码字符串
   */
  function decodeUTF8(str) {
    return String(str).replace(
      /[\u00c0-\u00df][\u0080-\u00bf]/g,
      function (c) {
        var cc = (c.charCodeAt(0) & 0x1f) << 6 | (c.charCodeAt(1) & 0x3f);
        return String.fromCharCode(cc);
      }
    ).replace(
      /[\u00e0-\u00ef][\u0080-\u00bf][\u0080-\u00bf]/g,
      function (c) {
        var cc = (c.charCodeAt(0) & 0x0f) << 12 | (c.charCodeAt(1) & 0x3f) << 6 | (c.charCodeAt(2) & 0x3f);
        return String.fromCharCode(cc);
      }
    );
    return str;
  }
  /**
   * 参考了 c-struct 的接口
   * c-struct 问题是：不支持浏览器环境、不支持有符号数、不支持 int64、扩展性不高
   *
   * @see https://github.com/majimboo/c-struct
   */
  /**
   * 数据结构集合
   * @type {Object}
   */
  var schemas = {};
  /**
   * 声明数组类型
   *
   * @param {string|Schema} schema 字节长度
   * @param {number} count 元素个数
   * @return {Schema} 返回数据结构
   */
  function array(schema, count) {
    return new Schema(function _unpack(buffer, options, offsets) {
      var result = [];
      for (var i = 0; i < count; i++) {
        result.push(unpack(schema, buffer, options, offsets));
      }
      return result;
    }, function _pack(value, options, buffer) {
      for (var i = 0; i < count; i++) {
        pack(schema, value[i], options, buffer)
      }
    });
  }
  exports.array = array;
  /**
   * 声明指定长度的数组类型
   *
   * @param {string|Schema} lengthSchema 长度类型
   * @param {string|Schema} itemSchema 元素类型
   * @return {Schema} 返回数据结构
   */
  function lengthArray(lengthSchema, itemSchema) {
    return new Schema(function _unpack(buffer, options, offsets) {
      var length = unpack(lengthSchema, buffer, options, offsets);
      if (isNaN(length)) {
        throw new Error('Length is not a numeric type.');
      }
      var result = [];
      for (var i = 0; i < length; i++) {
        result.push(unpack(itemSchema, buffer, options, offsets));
      }
      return result;
    }, function _pack(value, options, buffer) {
      if (!value) {
        pack(lengthSchema, 0, options, buffer)
      } else {
        pack(lengthSchema, value.length, options, buffer)
        for (var i = 0; i < value.length; i++) {
          pack(itemSchema, value[i], options, buffer)
        }
      }
    });
  }
  exports.lengthArray = lengthArray;
  /**
   * 声明指定 uint8 长度的数组类型
   *
   * @param {string|Schema} itemSchema 元素类型
   * @return {Schema} 返回数据结构
   */
  function shortArray(itemSchema) {
    return lengthArray('uint8', itemSchema);
  }
  exports.shortArray = shortArray;
  /**
   * 声明指定 uint16 长度的数组类型
   *
   * @param {string|Schema} itemSchema 元素类型
   * @return {Schema} 返回数据结构
   */
  function longArray(itemSchema) {
    return lengthArray('uint16', itemSchema);
  }
  exports.longArray = longArray;
  /**
   * 声明指定长度的字符串
   *
   * @param {string|Schema} lengthSchema 长度类型
   * @return {Schema} 返回数据结构
   */
  function lengthString(lengthSchema) {
    var schema = lengthArray(lengthSchema, 'uint8');
    return new Schema(function _unpack(buffer, options, offsets) {
      var bytes = unpack(schema, buffer, options, offsets);
      if (typeof Buffer !== 'undefined') { // NodeJS
        return new Buffer(bytes).toString();
      }
      return decodeUTF8(String.fromCharCode(bytes));
    }, function _pack(value, options, buffer) {
      var bytes;
      if (typeof Buffer !== 'undefined') { // NodeJS
        bytes = new Buffer(value);
      } else {
        bytes = encodeUTF8(value).split('');
      }
      pack(schema, new Buffer(value), options, buffer);
    });
  }
  /**
   * 短字符串类型
   */
  exports.shortString = lengthString('uint8');
  /**
   * 长字符串类型
   */
  exports.longString = lengthString('uint16');
  /**
   * 数据结构
   *
   * @constructor 构造数据结构类型
   */
  function Schema(unpack, pack) {
    this.unpack = unpack;
    this.pack = pack;
  }
  /**
   * 标准数值类型
   */
  [
    ['int8', 'Int8', 1],
    ['uint8', 'Uint8', 1],
    ['int16', 'Int16', 2],
    ['uint16', 'Uint16', 2],
    ['int32', 'Int32', 4],
    ['uint32', 'Uint32', 4],
    ['float32', 'Float32', 4],
    ['float64', 'Float64', 8]
  ].forEach(function (item) {
    var name = item[0];
    var dataViewType = item[1];
    var size = item[2];
    exports[name] = name;
    schemas[name] = new Schema(
      (function (dataViewMethod) {
        return function unpack(buffer, options, offsets) {
          var offset = offsets[0];
          offsets[0] += size;
          var dataView;
          if (buffer instanceof DataView) {
            dataView = buffer;
          } else {
            dataView = new DataView(buffer);
          }
          return dataView[dataViewMethod](offset, options.littleEndian);
        };
      })('get' + dataViewType), (function (dataViewMethod) {
        return function pack(value, options, buffer) {
          // value = value || 0;
          var arrayBuffer = new ArrayBuffer(size);
          var dataView = new DataView(arrayBuffer);
          var uint8Array = new Uint8Array(arrayBuffer);
          dataView[dataViewMethod](0, value, options.littleEndian);
          [].push.apply(buffer, uint8Array);
        };
      })('set' + dataViewType)
    );
  });
  /**
   * 类型别名
   */
  var alias = [
    ['double', 'float64'],
    ['float', 'float32'],
    ['byte', 'uint8'],
    ['word', 'uint32'],
  ];
  alias.forEach(function (item) {
    var name = item[0];
    var schema = item[1];
    exports[name] = schemas[name] = schemas[schema];
  });
  /**
   * 注册一个数据结构信息
   *
   * @param {string} name 数据结构名
   * @param {Object} schema 数据结构
   * @return {Object} 返回 schema 参数
   */
  function register(name, schema) {
    schemas[name] = schema;
  }
  exports.register = register;
  /**
   * 确保是 ArrayBuffer 类型
   *
   * @param {Array|Buffer} 数组和缓冲区
   * @return {ArrayBuffer} 返回转换后的 ArrayBuffer
   */
  function arrayBufferFrom(buffer) {
    if (buffer instanceof ArrayBuffer) {
      return buffer;
    }
    var ab = new ArrayBuffer(buffer.length);
    var arr = new Uint8Array(ab, 0, buffer.length);
    arr.set(buffer);
    return ab;
  }
  exports.arrayBufferFrom = arrayBufferFrom;
  /**
   * 解包
   *
   * @param {string|Object|Schema} schema 数据结构信息
   * @param {ArrayBuffer|Buffer} buffer 缓冲区
   * @param {Array=} offsets 读取偏移，会被改写
   * @return {Number|Object} 返回解包的值
   */
  function unpack(schema, buffer, options, offsets) {
    if (!schema) {
      throw new Error('Parameter "schema" is undefined.');
    }
    options = options || {};
    offsets = offsets || [0];
    if (!(schema instanceof Schema)) {
      if (typeof schema === 'string') {
        schema = schemas[schema];
      }
    }
    if (!(buffer instanceof ArrayBuffer)) {
      buffer = arrayBufferFrom(buffer);
    }
    if (!schema) {
      throw new Error('Parameter "schema" is unregister.');
    }
    if (typeof schema.unpack === 'function') {
      return schema.unpack(buffer, options, offsets);
    }
    var result = {};
    Object.keys(schema).forEach(function (key) {
      result[key] = unpack(schema[key], buffer, options, offsets);
    });
    return result;
  }
  exports.unpack = unpack;
  /**
   * 组包
   *
   * @param {string|Object|Schema} schema 数据结构信息
   * @param {Number|Object} data 数据
   * @param {Object} options 配置信息
   * @return {ArrayBuffer}
   */
  function pack(schema, data, options, buffer) {
    /*<debug>
    console.log('pack(schema: %j)', schema);
    </debug>*/
    if (!schema) {
      throw new Error('Parameter "schema" is undefined.');
    }
    var root;
    if (!buffer) {
      buffer = [];
      root = true;
    }
    if (!(schema instanceof Schema)) {
      if (typeof schema === 'string') {
        schema = schemas[schema];
      }
    }
    if (!schema) {
      throw new Error('Parameter "schema" is unregister.');
    }
    options = options || {};
    if (typeof schema.pack === 'function') {
      schema.pack(data, options, buffer);
    } else {
      Object.keys(schema).forEach(function (key) {
        pack(schema[key], data[key], options, buffer);
      });
    }
    if (root) {
      return arrayBufferFrom(buffer);
    }
  }
  exports.pack = pack;
  if (typeof define === 'function') {
    if (define.amd || define.cmd) {
      define(function () {
        return exports;
      });
    }
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = exports;
  } else {
    window[exportName] = exports;
  }
})('jpacks');