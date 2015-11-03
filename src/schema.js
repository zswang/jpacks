/*<define>*/
function createSchema() {
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView
   */

  var schemas = {};

  /**
   * 数据结构
   * @param options 配置项
   * @param {Function} options.unpack 数据解析的方法
   *    [[[
   *    @param {ArrayBuffer|Buffer|Array} buffer 数据缓存
   *    @param {Object=} options 配置项
   *    @param {Array=} offsets 第一个原始为偏移，数值类型是为了能修改值
   *    @return {Any} 返回解析后的对象
   *    ]]]
   *    function unpack(buffer, options, offsets) {}
   * @param {Function} options.pack 数据打包的方法
   *    [[[
   *    @param {Any} value 需要打包的对象
   *    @param {Object=} options 配置项
   *    @param {buffer=} {Array} 目标字节数组
   *    ]]]
   *    function pack(value, options, buffer) {}
   * @param {number} options.size 占用大小，如果为负数则为动态类型，绝对值为最小尺寸
   * @param {string} options.name 类型名称
   * @param {string} options.namespace 命名空间 e.g. ( 'base': 基础类型 )
   * @constructor 构造数据结构类型
   */
  function Schema(options) {
    var self = this;
    Object.keys(options).forEach(function (key) {
      self[key] = options[key];
    });
  }

  /**
   * 定义数据结构
   *
   * @param {string} name 数据结构名
   * @param {Schema|string|Function} schema 数据结构或者数据结构名
   * @return {boolean} 返回是否定义成功
   */
  Schema.register = function (name, schema) {
    /*<safe>*/
    if (typeof name === 'undefined') {
      throw new Error('Parameter "name" is undefined.');
    }
    /*</safe>*/
    schemas[name] = schema;
    if (!Schema[name]) { // 避免覆盖系统方法
      Schema[name] = schema;
    }
  };

  /**
   * 匹配数据结构的方法集合
   *
   * @type {Array}
   */
  var schemaPatterns = [

    function _pattern(schema) {
      var dicts = {};
      var findSchema = schema;
      while (typeof findSchema === 'string') {
        if (dicts[findSchema]) {
          return;
        }
        findSchema = schemas[findSchema];
        dicts[findSchema] = true;
      }
      return findSchema;
    }

  ];
  /**
   * 添加匹配数据结构的方法集合
   *
   * @param {Function} pattern 匹配方法
   * [[[
   *   @param {string|object} schema 用于测试的对象
   *   @return {Schema} 返回匹配的配数据结构，如果没有匹配的结果则返回 undefined
   *   function _pattern(schema) {}
   * ]]]
   */
  Schema.pushPattern = function (pattern) {
    /*<safe>*/
    if (typeof pattern !== 'function') {
      return;
    }
    /*</safe>*/
    schemaPatterns.push(pattern);
  };

  /**
   * 确保是数据结构
   *
   * @param {string|Object|Schema} schema 数据结构名
   * @return {Schema} 返回名字对应的数据结构
   */
  Schema.from = function (schema) {
    /*<safe>*/
    if (typeof schema === 'undefined') { // 无效数据
      return;
    }
    /*</safe>*/
    if (schema instanceof Schema) {
      return schema;
    }
    var filter = -1;
    for (var i = 0; i < schemaPatterns.length; i++) { // 解析表达式
      if (filter === i) { // 已经被过滤
        continue;
      }
      var match = schemaPatterns[i](schema);
      if (match) {
        if (match instanceof Schema) {
          return match;
        }
        schema = match; // 类型改变
        filter = i; // 不要走同一个规则
        i = 0; // 重新扫描
      }
    }
  };

  /**
   * 默认低字节序
   *
   * @type {boolean}
   */
  var defaultOptions = {
    littleEndian: true
  };

  /**
   * 设置默认配置
   *
   * @param {boolean} options 默认值
   */
  function setDefaultOptions(options) {
    options = options || {};
    Object.keys(options).forEach(function (key) {
      defaultOptions[key] = options[key];
    });
  }
  Schema.setDefaultOptions = setDefaultOptions;

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
  Schema.arrayBufferFrom = arrayBufferFrom;

  /**
   * 解包
   *
   * @param {string|Object|Schema} packSchema 数据结构信息
   * @param {ArrayBuffer|Buffer} buffer 缓冲区
   * @param {Array=} offsets 读取偏移，会被改写
   * @return {Number|Object} 返回解包的值
   */
  function unpack(packSchema, buffer, options, offsets) {
    /*<debug>
    console.log('unpack(packSchema: %j, buffer: %j)', packSchema, buffer);
    //</debug>*/
    var schema = Schema.from(packSchema);
    if (!schema) {
      throw new Error('Parameter schema "' + packSchema + '" is unregister.');
    }

    buffer = arrayBufferFrom(buffer); // 确保是 ArrayBuffer 类型
    options = options || {};
    offsets = offsets || [0];
    Object.keys(defaultOptions).forEach(function (key) {
      if (typeof options[key] === 'undefined') {
        options[key] = defaultOptions[key];
      }
    });
    return schema.unpack(buffer, options, offsets); // 解码
  }
  Schema.unpack = unpack;

  /**
   * 组包
   *
   * @param {string|Object|Schema} schema 数据结构信息
   * @param {Number|Object} data 数据
   * @param {Object} options 配置信息
   * @return {ArrayBuffer}
   */
  function pack(packSchema, data, options, buffer) {
    /*<debug>
    console.log('pack(schema: %j)', packSchema);
    //</debug>*/

    var schema = Schema.from(packSchema);
    if (!schema) {
      throw new Error('Parameter schema "' + packSchema + '" is unregister.');
    }

    buffer = buffer || [];

    options = options || {};
    Object.keys(defaultOptions).forEach(function (key) {
      if (typeof options[key] === 'undefined') {
        options[key] = defaultOptions[key];
      }
    });
    schema.pack(data, options, buffer);

    return buffer;
  }
  Schema.pack = pack;

  /**
   * 凑足参数则调用函数
   *
   * @param {Function} fn 任意函数
   * @param {Array=} args 已经凑到的参数
   '''<example>'''
   * @example together():base
    ```js
    var _ = jpacks;

    function f(a, b, c) {
      console.log(JSON.stringify([a, b, c]));
    }
    var t = _.together(f);

    t(1)()(2, 3);
    // -> [1,2,3]

    t(4)(5)()(6);
    // -> [4,5,6]

    t(7, 8, 9);
    // -> [7,8,9]

    t('a', 'b')('c');
    // -> ["a","b","c"]

    t()('x')()()('y')()()('z');
    // -> ["x","y","z"]
    ```
   '''</example>'''
   '''<example>'''
   * @example together():hook
    ```js
    var _ = jpacks;
    function f(a, b, c) {}

    var t = _.together(f, function(t, args) {
      t.schema = 'f(' + args + ')';
    });
    console.log(t(1)(2).schema);
    // -> f(1,2)
    ```
   '''</example>'''
   */
  function together(fn, hook, args) {
    if (fn.length <= 0) {
      return fn;
    }
    var result = function() {
      var list = [];
      [].push.apply(list, args);
      [].push.apply(list, arguments);
      if (list.length >= fn.length) {
        return fn.apply(null, list);
      } else {
        var result = together(fn, hook, list);
        if (typeof hook === 'function') {
          hook(result, list);
        }
        return result;
      }
    };
    return result;
  }
  Schema.together = together;

  var guid = 0;

  /**
   * 获取对象的结构表达式
   *
   * @param {Any} obj 目标对象
   */
  function stringify(obj) {
    if (arguments.length > 1) {
      var result = [];
      for (var i = 0; i < arguments.length; i++) {
        result.push(stringify(arguments[i]));
      }
      return result.join();
    }
    function scan(obj) {
      if (!obj) {
        return obj;
      }
      if (obj.namespace) {
        if (obj.namespace === 'number') {
          return obj.name;
        }
        if (obj.args) {
          return obj.namespace + '(' + stringify.apply(null, obj.args) + ')';
        }
        return obj.namespace;
      }

      if (obj.name) {
        return obj.name;
      }

      if (typeof obj === 'function') {
        obj.name = '_pack_fn' + (guid++);
        Schema.define(obj.name, obj);
        return obj.name;
      }
      if (typeof obj === 'object') {
        var result = new obj.constructor();
        Object.keys(obj).forEach(function (key) {
          result[key] = scan(obj[key]);
        });
        return result;
      }
      return obj;
    }
    return JSON.stringify(scan(obj) || '').replace(/"/g, '');
  }
  Schema.stringify = stringify;

  Schema.prototype.toString = function () {
    return stringify(this);
  };
  return Schema;
}
/*</define>*/
module.exports = createSchema;