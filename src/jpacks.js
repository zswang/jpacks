(function(exportName) {

  /*<remove>*/
  'use strict';
  /*</remove>*/

  /*<jdists encoding='ejs' data='../package.json'>*/
  /**
   * @file <%- name %>
   *
   * <%- description %>
   * @author
       <% (author instanceof Array ? author : [author]).forEach(function (item) { %>
   *   <%- item.name %> (<%- item.url %>)
       <% }); %>
   * @version <%- version %>
       <% var now = new Date() %>
   * @date <%- [
        now.getFullYear(),
        now.getMonth() + 101,
        now.getDate() + 100
      ].join('-').replace(/-1/g, '-') %>
   */
  /*</jdists>*/

  var exports = {};

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
  var types = {};

  /**
   * 字节类型
   * @param {Number} size 字节长度
   * @return {Schema} 返回数据结构
   */
  types.bytes = function(size) {
    var key = 'bytes(' + size + ')';
    if (schemas[key]) {
      return schemas[key];
    }
    var schema = new Schema(function unpack(buffer, options, offsets) {
      var offset = offsets[0];
      offsets[0] += size;
      return new Uint8Array(buffer, offset, size);
    }, function pack(value, options, buffer) {
      var arrayBuffer = new ArrayBuffer(size);
      var uint8Array = new Uint8Array(arrayBuffer);
      uint8Array.set(value);
      [].push.apply(buffer, uint8Array);
    });
    return schemas[key] = schema;
  };

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
  ].forEach(function(item) {
    var name = item[0];
    var dataViewType = item[1];
    var size = item[2];
    types[name] = name;
    schemas[name] = new Schema(
      (function(dataViewMethod) {
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
      })('get' + dataViewType), (function(dataViewMethod) {
        return function pack(value, options, buffer) {
          var arrayBuffer = new ArrayBuffer(size);
          var dataView = new DataView(arrayBuffer);
          var uint8Array = new Uint8Array(arrayBuffer);
          dataView[dataViewMethod](0, value, options.littleEndian);
          [].push.apply(buffer, uint8Array);
        };
      })('set' + dataViewType)
    );
  });

  schemas['double'] = schemas['float64'];
  schemas['float'] = schemas['float32'];

  /**
   * 注册一个数据结构信息
   *
   * @param {string} name 数据结构名
   * @param {Object} schema 数据结构
   * @return {Object} 返回 schema 参数
   */
  function register(name, schema) {
    schemas[name] = schema;
    types[name] = name;

    return schemas[name];
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
    if (typeof options.littleEndian === 'undefined') {
      options.littleEndian = true;
    }
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
    Object.keys(schema).forEach(function(key) {
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
    if (typeof options.littleEndian === 'undefined') {
      options.littleEndian = true;
    }
    if (typeof schema.pack === 'function') {
      schema.pack(data, options, buffer);
    }

    Object.keys(schema).forEach(function(key) {
      pack(schema[key], data[key], options, buffer);
    });

    if (root) {
      return arrayBufferFrom(buffer);
    }
  }
  exports.pack = pack;

  exports.types = types;

  if (typeof define === 'function') {
    if (define.amd || define.cmd) {
      define(function() {
        return exports;
      });
    }
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = exports;
  } else {
    window[exportName] = exports;
  }

})('jpacks');
