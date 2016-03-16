(function (exportName) {
  /**
   * @file jpacks
   *
   * Binary data packing and unpacking.
   * @author
   *   zswang (http://weibo.com/zswang)
   * @version 0.6.10
   * @date 2016-03-16
   */
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
    options = options || {};
    var self = this;
    Object.keys(options).forEach(function(key) {
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
  Schema.register = function(name, schema) {
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
   * register 别名
   */
  Schema.def = Schema.register;
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
  Schema.pushPattern = function(pattern) {
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
  Schema.from = function(schema) {
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
    Object.keys(options).forEach(function(key) {
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
    /*<safe>*/
    if (!schema) {
      throw new Error('Parameter schema "' + packSchema + '" is unregister.');
    }
    /*</safe>*/
    buffer = arrayBufferFrom(buffer); // 确保是 ArrayBuffer 类型
    options = options || {};
    offsets = offsets || [0];
    Object.keys(defaultOptions).forEach(function(key) {
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
    /*<safe>*/
    if (!schema) {
      throw new Error('Parameter schema "' + packSchema + '" is unregister.');
    }
    /*</safe>*/
    buffer = buffer || [];
    options = options || {};
    Object.keys(defaultOptions).forEach(function(key) {
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
    // > [1,2,3]
    t(4)(5)()(6);
    // > [4,5,6]
    t(7, 8, 9);
    // > [7,8,9]
    t('a', 'b')('c');
    // > ["a","b","c"]
    t()('x')()()('y')()()('z');
    // > ["x","y","z"]
    ```
   * @example together():hook
    ```js
    var _ = jpacks;
    function f(a, b, c) {}
    var t = _.together(f, function(t, args) {
      t.schema = 'f(' + args + ')';
    });
    console.log(t(1)(2).schema);
    // > f(1,2)
    function go() {
      console.log(1);
    }
    var g = _.together(go);
    g();
    // > 1
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
      if (obj === null) {
        return 'null';
      }
      if (!obj) {
        return obj;
      }
      if (obj.namespace) {
        if (obj.namespace === 'number') {
          return "'" + obj.name + "'";
        }
        if (obj.args) {
          return obj.namespace + '(' + stringify.apply(null, obj.args) + ')';
        }
        return "'" + obj.namespace + "'";
      }
      if (typeof obj === 'function') {
        if (!obj.name) {
          obj.namespace = '$fn';
          return obj.namespace;
        }
      } else if (typeof obj === 'object') {
        var result = new obj.constructor();
        Object.keys(obj).forEach(function(key) {
          result[key] = scan(obj[key]);
        });
        return result;
      }
      if (obj.name) {
        return "'" + obj.name + "'";
      }
      if (typeof obj === 'string') {
        return "'" + obj + "'";
      }
      return obj;
    }
    return JSON.stringify(scan(obj) || '').replace(/"/g, '');
  }
  Schema.stringify = stringify;
  Schema.prototype.toString = function() {
    return stringify(this);
  };
  return Schema;
}
  /**
   * 创建数据结构作用域
   *
   * @return 返回 Schema
   */
  function create() {
    var Schema = createSchema();
  /**
   * 基础类型
   *
   * @type {Object}
   *   @key 基础类型名称
   *   @value
   *       @field {string} type 对应 DataView 类型名
   *       @field {number} size 数据大小，单位 byte
   *       @field {Array of string} alias 别名
   '''<example>'''
   * @example all number
    ```js
    var _ = jpacks;
    var _map = {
      bytes: _.bytes(8)
    };
    'int8,int16,int32,uint8,uint16,uint32,float32,float64,shortint,smallint,longint,byte,word,longword'.split(/,/).forEach(function (item) {
      _map[item] = item;
    });
    var _schema = _.union(_map, 8);
    console.log(_.stringify(_schema));
    // > union({bytes:array('uint8',8),int8:'int8',int16:'int16',int32:'int32',uint8:'uint8',uint16:'uint16',uint32:'uint32',float32:'float32',float64:'float64',shortint:'shortint',smallint:'smallint',longint:'longint',byte:'byte',word:'word',longword:'longword'},8)
    var buffer = _.pack(_schema, {
      bytes: [0x12, 0x23, 0x34, 0x45, 0x56, 0x67, 0x78, 0x89]
    });
    console.log(buffer.join(' '));
    // > 18 35 52 69 86 103 120 137
    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > {"bytes":[18,35,52,69,86,103,120,137],"int8":18,"int16":8978,"int32":1161044754,"uint8":18,"uint16":8978,"uint32":1161044754,"float32":2882.19189453125,"float64":-4.843717058781651e-263,"shortint":18,"smallint":8978,"longint":1161044754,"byte":18,"word":8978,"longword":1161044754}
    ```
   '''</example>'''
   * @example map is object
   */
  var bases = {
    int8: {
      type: 'Int8',
      size: 1,
      alias: ['shortint'],
      array: Int8Array
    },
    uint8: {
      type: 'Uint8',
      size: 1,
      alias: ['byte'],
      array: Uint8Array
    },
    int16: {
      type: 'Int16',
      size: 2,
      alias: ['smallint'],
      array: Int16Array
    },
    uint16: {
      type: 'Uint16',
      size: 2,
      alias: ['word'],
      array: Uint16Array
    },
    int32: {
      type: 'Int32',
      size: 4,
      alias: ['longint'],
      array: Int32Array
    },
    uint32: {
      type: 'Uint32',
      size: 4,
      alias: ['longword'],
      array: Uint32Array
    },
    float32: {
      type: 'Float32',
      size: 4,
      alias: ['single'],
      array: Float32Array
    },
    float64: {
      type: 'Float64',
      size: 8,
      alias: ['double'],
      array: Float64Array
    },
  };
  /**
   * 定义基础类型
   */
  Object.keys(bases).forEach(function (name) {
    var item = bases[name];
    var schema = new Schema({
      unpack: (function (method) {
        return function _unpack(buffer, options, offsets) {
          var offset = offsets[0];
          offsets[0] += item.size;
          var dataView;
          if (buffer instanceof DataView) {
            dataView = buffer;
          } else {
            dataView = new DataView(buffer);
          }
          return dataView[method](offset, options.littleEndian);
        };
      })('get' + item.type),
      pack: (function (method) {
        return function _pack(value, options, buffer) {
          var arrayBuffer = new ArrayBuffer(item.size);
          var dataView = new DataView(arrayBuffer);
          var uint8Array = new Uint8Array(arrayBuffer);
          dataView[method](0, value, options.littleEndian);
          [].push.apply(buffer, uint8Array);
        };
      })('set' + item.type),
      size: item.size,
      name: name,
      namespace: 'number',
      array: item.array
    });
    Schema.register(name, schema);
    (item.alias || []).forEach(function (alias) {
      Schema.register(alias, schema);
    });
  });
  /**
   * 声明指定长度或者下标的数组
   *
   * @param {string|Schema} item 元素类型
   * @param {string|Schema|number=} count 下标类型或个数
   * @return {Schema|Function} 返回数据结构
   '''<example>'''
   * @example arrayCreator():static array
    ```js
    var _ = jpacks;
    var _schema = jpacks.array('int16', 2);
    console.log(String(_schema));
    // > array('int16',2)
    var value = [12337, 12851];
    var buffer = jpacks.pack(_schema, value);
    console.log(buffer.join(' '));
    // > 49 48 51 50
    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > [12337,12851]
    ```
   * @example arrayCreator():dynamic array
    ```js
    var _ = jpacks;
    var _schema = jpacks.array('int16', 'int8');
    console.log(String(_schema));
    // > array('int16','int8')
    var value = [12337, 12851];
    var buffer = jpacks.pack(_schema, value);
    console.log(buffer.join(' '));
    // > 2 49 48 51 50
    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > [12337,12851]
    ```
   * @example arrayCreator():dynamic array 2
    ```js
    var _ = jpacks;
    var _schema = jpacks.array('int16')(6);
    console.log(String(_schema));
    // > array('int16',6)
    var value = [12337, 12851];
    var buffer = jpacks.pack(_schema, value);
    console.log(buffer.join(' '));
    // > 49 48 51 50 0 0 0 0 0 0 0 0
    console.log(JSON.stringify(jpacks.unpack(_schema, buffer)));
    // > [12337,12851,0,0,0,0]
    ```
   * @example arrayCreator():auto size int8
    ```js
    var _ = jpacks;
    var _schema = _.array('int8', null);
    console.log(_.stringify(_schema))
    // > array('int8',null)
    var buffer = _.pack(_schema, [0, 1, 2, 3, 4, 5, 6, 7]);
    console.log(buffer.join(' '));
    // > 0 1 2 3 4 5 6 7
    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > [0,1,2,3,4,5,6,7]
    ```
   * @example arrayCreator():auto size int16 littleEndian = true
    ```js
    var _ = jpacks;
    var _schema = _.array('int16', null);
    var options = {
      littleEndian: true
    };
    console.log(_.stringify(_schema))
    // > array('int16',null)
    var buffer = _.pack(_schema, [0, 1, 2, 3, 4, 5, 6, 7], options);
    console.log(buffer.join(' '));
    // > 0 0 1 0 2 0 3 0 4 0 5 0 6 0 7 0
    console.log(JSON.stringify(_.unpack(_schema, buffer, options)));
    // > [0,1,2,3,4,5,6,7]
    ```
   * @example arrayCreator():auto size int16 littleEndian = false
    ```js
    var _ = jpacks;
    var _schema = _.array('int16', null);
    var options = {
      littleEndian: false
    };
    console.log(_.stringify(_schema))
    // > array('int16',null)
    var buffer = _.pack(_schema, [0, 1, 2, 3, 4, 5, 6, 7], options);
    console.log(buffer.join(' '));
    // > 0 0 0 1 0 2 0 3 0 4 0 5 0 6 0 7
    console.log(JSON.stringify(_.unpack(_schema, buffer, options)));
    // > [0,1,2,3,4,5,6,7]
    ```
   * @example arrayCreator():size fault tolerant
    ```js
    var _ = jpacks;
    var _schema = _.array('int8', 4);
    console.log(_.stringify(_schema))
    // > array('int8',4)
    var buffer = _.pack(_schema, [0, 1, 2, 3, 4, 5, 6, 7]);
    console.log(buffer.join(' '));
    // > 0 1 2 3
    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > [0,1,2,3]
    var buffer = _.pack(_schema, [0, 1, 2]);
    console.log(buffer.join(' '));
    // > 0 1 2 0
    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > [0,1,2,0]
    ```
   '''</example>'''
   */
  function arrayCreator(item, count) {
    /*<safe>*/
    if (typeof item === 'undefined') {
      throw new Error('Parameter "item" is undefined.');
    }
    /*</safe>*/
    /*<debug>
    console.log('arrayCreator()', Schema.stringify(item, count));
    //</debug>*/
    var countSchema;
    if (count !== 'number' && count !== null) { // static size && auto size
      countSchema = Schema.from(count);
    }
    return new Schema({
      unpack: function _unpack(buffer, options, offsets) {
        var length;
        if (countSchema) {
          length = Schema.unpack(countSchema, buffer, options, offsets);
        } else {
          length = count;
        }
        if (length === 0) {
          return [];
        }
        var result = [];
        var itemSchema = Schema.from(item);
        if (itemSchema.array && (options.littleEndian || itemSchema.size === 1)) {
          var offset = offsets[0];
          var size = length === null ? buffer.byteLength - offset : itemSchema.size * length;
          /* TypeArray littleEndian is true */
          var arrayBuffer = new ArrayBuffer(size);
          var typeArray = new itemSchema.array(arrayBuffer);
          var uint8Array = new Uint8Array(arrayBuffer);
          uint8Array.set(
            new Uint8Array(buffer, offset, Math.min(size, buffer.byteLength - offset))
          );
          [].push.apply(result, typeArray);
          offsets[0] += size;
          return result;
        }
        if (length === null) { // auto size
          var laseOffset;
          while (offsets[0] < buffer.byteLength && laseOffset !== offsets[0]) {
            laseOffset = offsets[0];
            result.push(Schema.unpack(itemSchema, buffer, options, offsets));
          }
        } else {
          for (var i = 0; i < length; i++) {
            result.push(Schema.unpack(itemSchema, buffer, options, offsets));
          }
        }
        return result;
      },
      pack: function _pack(value, options, buffer) {
        var itemSchema = Schema.from(item);
        if (!value && !countSchema) { // 数据不变
          return;
        }
        var length;
        if (countSchema) {
          length = value ? value.length : 0;
          Schema.pack(countSchema, length, options, buffer);
        } else {
          length = count === null ? (value || []).length : count;
        }
        if (!value || !length) {
          return;
        }
        if (itemSchema.array && (options.littleEndian || itemSchema.size === 1)) {
          var size = itemSchema.size * length;
          /* TypeArray littleEndian is true */
          var arrayBuffer = new ArrayBuffer(size);
          var typeArray = new itemSchema.array(arrayBuffer);
          typeArray.set(value.slice(0, length));
          var uint8Array = new Uint8Array(arrayBuffer);
          [].push.apply(buffer, uint8Array);
          return;
        }
        for (var i = 0; i < length; i++) {
          Schema.pack(itemSchema, (value || [])[i], options, buffer);
        }
      },
      namespace: 'array',
      args: arguments,
      size: count === 'number' ? itemSchema.size * count : undefined
    });
  }
  var array = Schema.together(arrayCreator, function(fn, args) {
    fn.namespace = 'array';
    fn.args = args;
  });
  Schema.register('array', array);
  function shortArray(itemSchema) {
    return array(itemSchema, 'uint8');
  }
  Schema.register('shortArray', shortArray);
  function smallArray(itemSchema) {
    return array(itemSchema, 'uint16');
  }
  Schema.register('smallArray', smallArray);
  function longArray(itemSchema) {
    return array(itemSchema, 'uint32');
  }
  Schema.register('longArray', longArray);
  /**
   * 字节数组
   *
   * @param {string|Schema|number=} count 下标类型或个数
   * @return {Schema|Function} 返回数据结构
   '''<example>'''
   * @example bytes()
    ```js
    var _ = jpacks;
    var _schema = jpacks.bytes(6);
    console.log(String(_schema));
    // > array('uint8',6)
    var value = [0, 1, 2, 3, 4, 5];
    var buffer = jpacks.pack(_schema, value);
    console.log(buffer.join(' '));
    // > 0 1 2 3 4 5
    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > [0,1,2,3,4,5]
    ```
   * @example bytes() auto size
    ```js
    var _ = jpacks;
    var _schema = jpacks.bytes(null);
    console.log(String(_schema));
    // > array('uint8',null)
    var value = [0, 1, 2, 3, 4, 5];
    var buffer = jpacks.pack(_schema, value);
    console.log(buffer.join(' '));
    // > 0 1 2 3 4 5
    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > [0,1,2,3,4,5]
    ```
    '''</example>'''
   */
  function bytes(count) {
    return Schema.array('uint8', count);
  }
  Schema.register('bytes', bytes);
  /**
   * 定义一个对象结构
   *
   * @param {object} schema 数据结构
   * @return {Schema} 返回构建的数据结构
   '''<example>'''
   * @example objectCreator:array
    ```js
    var _ = jpacks;
    var _schema = _.object([_.shortString, _.word]);
    console.log(_.stringify(_schema));
    // > object([string('uint8'),'uint16'])
    var buffer = _.pack(_schema, ['zswang', 1978]);
    console.log(buffer.join(' '));
    // > 6 122 115 119 97 110 103 186 7
    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > ["zswang",1978]
    ```
   * @example objectCreator:object
    ```js
    var _ = jpacks;
    var _schema = _.object({
      name: _.shortString,
      year: _.word
    });
    console.log(_.stringify(_schema));
    // > object({name:string('uint8'),year:'uint16'})
    var buffer = _.pack(_schema, {
        name: 'zswang',
        year: 1978
      });
    console.log(buffer.join(' '));
    // > 6 122 115 119 97 110 103 186 7
    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > {"name":"zswang","year":1978}
    ```
   '''</example>'''
   */
  function objectCreator(objectSchema) {
    /*<safe>*/
    if (typeof objectSchema !== 'object') {
      throw new Error('Parameter "schemas" must be a object type.');
    }
    /*</safe>*/
    if (objectSchema instanceof Schema) {
      return objectSchema;
    }
    var keys = Object.keys(objectSchema);
    return new Schema({
      unpack: function _unpack(buffer, options, offsets) {
        var result = new objectSchema.constructor();
        var $scope = options.$scope;
        options.$scope = {
          target: result,
          offsets: new objectSchema.constructor(),
          schema: objectSchema
        };
        keys.forEach(function (key) {
          options.$scope.offsets[key] = offsets[0];
          result[key] = Schema.unpack(objectSchema[key], buffer, options, offsets);
        });
        options.$scope = $scope;
        return result;
      },
      pack: function _pack(value, options, buffer) {
        var $scope = options.$scope;
        options.$scope = {
          target: value,
          offsets: new objectSchema.constructor(),
          schema: objectSchema
        };
        keys.forEach(function (key) {
          options.$scope.offsets[key] = buffer.length;
          Schema.pack(objectSchema[key], value[key], options, buffer);
        });
        options.$scope = $scope;
      },
      args: arguments,
      namespace: 'object'
    });
  }
  var object = Schema.together(objectCreator, function (fn, args) {
    fn.namespace = 'object';
    fn.args = args;
  });
  Schema.register('object', object);
  Schema.pushPattern(function _objectPattern(schema) {
    if (typeof schema === 'object') {
      if (schema instanceof Schema) {
        return;
      }
      if (schema instanceof Array) {
        return;
      }
      return object(schema);
    }
  });
  /**
   * 创建联合类型
   *
   * @param {number} size 联合类型总大小
   * @param {Object} schema 联合类型中出现的字段
   * @return {Schema} 返回联合类型
   '''<example>'''
   * @example unionCreator():base
    ```js
    var _ = jpacks;
    var _schema = _.union({
      length: _.byte,
      content: _.shortString
    }, 20);
    console.log(_.stringify(_schema));
    // > union({length:'uint8',content:string('uint8')},20)
    var buffer = _.pack(_schema, {
      content: '0123456789'
    });
    console.log(buffer.join(' '));
    // > 10 48 49 50 51 52 53 54 55 56 57 0 0 0 0 0 0 0 0 0
    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > {"length":10,"content":"0123456789"}
    ```
   '''</example>'''
   */
  function unionCreator(schemas, size) {
    /*<safe>*/
    if (typeof schemas !== 'object') {
      throw new Error('Parameter "schemas" must be a object type.');
    }
    if (schemas instanceof Schema) {
      throw new Error('Parameter "schemas" cannot be a Schema object.');
    }
    /*</safe>*/
    var keys = Object.keys(schemas);
    return new Schema({
      unpack: function _unpack(buffer, options, offsets) {
        var beginOffset = offsets[0];
        var result = {};
        keys.forEach(function (key) {
          offsets[0] = beginOffset;
          result[key] = Schema.unpack(schemas[key], buffer, options, offsets);
        });
        offsets[0] += size;
        return result;
      },
      pack: function _pack(value, options, buffer) {
        var arrayBuffer = new ArrayBuffer(size);
        var uint8Array = new Uint8Array(arrayBuffer);
        keys.forEach(function (key) {
          if (typeof value[key] === 'undefined') {
            return;
          }
          var temp = [];
          Schema.pack(schemas[key], value[key], options, temp);
          uint8Array.set(temp);
        });
        [].push.apply(buffer, uint8Array);
      },
      size: size,
      args: arguments,
      namespace: 'union'
    });
  }
  var union = Schema.together(unionCreator, function (fn, args) {
    fn.namespace = 'union';
    fn.args = args;
  });
  Schema.register('union', union);
  /**
   * 定义一个枚举结构
   *
   * @param {Schema} baseSchema 枚举结构的基础类型
   * @param {Array|Object} map 枚举类型字典
   * @return {Schema} 返回构建的数据结构
   '''<example>'''
   * @example enumsCreator():map is array
    ```js
    var _ = jpacks;
    var _schema = _.enums(['Sun', 'Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat'], 'uint8');
    console.log(_.stringify(_schema));
    // > enums({Sun:0,Mon:1,Tues:2,Wed:3,Thur:4,Fri:5,Sat:6},'uint8')
    var buffer = _.pack(_schema, 'Tues');
    console.log(buffer.join(' '));
    // > 2
    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > "Tues"
    ```
   * @example enumsCreator():map is object
    ```js
    var _ = jpacks;
    var _schema = _.enums({
      Unknown: -1,
      Continue: 100,
      Processing: 100,
      OK: 200,
      Created: 201,
      NotFound: 404
    }, 'int8');
    console.log(_.stringify(_schema));
    // > enums({Unknown:-1,Continue:100,Processing:100,OK:200,Created:201,NotFound:404},'int8')
    var buffer = _.pack(_schema, 'Unknown');
    console.log(buffer.join(' '));
    // > 255
    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > "Unknown"
    ```
   * @example enumsCreator():fault tolerant
    ```js
    var _ = jpacks;
    var _schema = _.enums({
      Unknown: -1,
      Continue: 100,
      Processing: 100,
      OK: 200,
      Created: 201,
      NotFound: 404
    }, 'int8');
    console.log(_.stringify(_schema));
    // > enums({Unknown:-1,Continue:100,Processing:100,OK:200,Created:201,NotFound:404},'int8')
    var buffer = _.pack(_schema, 2);
    console.log(buffer.join(' '));
    // > 2
    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > 2
    ```
   '''</example>'''
   */
  function enumsCreator(map, baseSchema) {
    baseSchema = Schema.from(baseSchema);
    /*<safe>*/
    if (!baseSchema) {
      throw new Error('Parameter "baseSchema" is undefined.');
    }
    if (baseSchema.namespace !== 'number') {
      throw new Error('Parameter "baseSchema" is not a numeric type.');
    }
    if (typeof map !== 'object') {
      throw new Error('Parameter "map" must be a object type.');
    }
    /*</safe>*/
    if (map instanceof Array) {
      var temp = {};
      map.forEach(function (item, index) {
        temp[item] = index;
      });
      map = temp;
    }
    var keys = Object.keys(map);
    return new Schema({
      unpack: function _unpack(buffer, options, offsets) {
        var baseValue = Schema.unpack(baseSchema, buffer, options, offsets);
        var result;
        keys.every(function (key) {
          if (map[key] === baseValue) {
            result = key;
            return false;
          }
          return true;
        });
        return result || baseValue;
      },
      pack: function _pack(value, options, buffer) {
        if (typeof value === 'number') {
          Schema.pack(baseSchema, value, options, buffer);
          return;
        }
        if (keys.every(function (key) {
          if (key === value) {
            Schema.pack(baseSchema, map[key], options, buffer);
            return false;
          }
          return true;
        })) {
          throw new Error('Not find enum "' + value + '".');
        }
      },
      namespace: 'enums',
      args: arguments
    });
  }
  var enums = Schema.together(enumsCreator, function (fn, args) {
    fn.namespace = 'enums';
    fn.args = args;
  });
  Schema.register('enums', enums);
  /*<function name="encodeUTF8">*/
  /**
   * 对字符串进行 utf8 编码
   *
   * param {string} str 原始字符串
   '''<example>'''
   * @example encodeUTF8():base
    ```js
    console.log(jstrs.encodeUTF8('汉'));
    // > æ±
    ```
   '''</example>'''
   */
  function encodeUTF8(str) {
    if (/[\u0080-\uffff]/.test(str)) {
      return unescape(encodeURIComponent(str));
    }
    return str;
  }
  /*</function>*/
  /*<function name="decodeUTF8">*/
  /**
   * 对 utf8 字符串进行解码
   *
   * @param {string} str 编码字符串
   '''<example>'''
   * @example decodeUTF8():base
    ```js
    console.log(jstrs.decodeUTF8('æ±'));
    // > 汉
    ```
   '''</example>'''
   */
  function decodeUTF8(str) {
    if (/[\u00c0-\u00df][\u0080-\u00bf]/.test(str) ||
      /[\u00e0-\u00ef][\u0080-\u00bf][\u0080-\u00bf]/.test(str)) {
      return decodeURIComponent(escape(str));
    }
    return str;
  }
  /*</function>*/
  /**
   * 将字符串转换为字节数组
   *
   * @param {string} value 字符串内容
   * @param {string=} options.encoding 编码类型，仅在 NodeJS 下生效，默认 'utf-8'
   * @return {Array} 返回字节数组
   * @return {Schema} 返回解析类型
   '''<example>'''
   * @example stringBytes():base
    var _ = jpacks;
    var buffer = _.pack(_.bytes(20), _.stringBytes('你好世界！Hello'));
    console.log(buffer.join(' '));
    // > 228 189 160 229 165 189 228 184 150 231 149 140 239 188 129 72 101 108 108 111
   '''<example>'''
   */
  function stringBytes(value, options) {
    if (!options.browser && typeof Buffer !== 'undefined') { // NodeJS
      return new Buffer(value, options.encoding);
    } else {
      return encodeUTF8(value).split('').map(function (item) {
        return item.charCodeAt();
      });
    }
  }
  Schema.stringBytes = stringBytes;
  /**
   * 声明指定长度的字符串
   *
   * @param {number|string|Schema} size 字节个数下标类型
   * @return {Schema} 返回数据结构
   '''<example>'''
   * @example stringCreator():static
    var _ = jpacks;
    var _schema = _.string(25);
    console.log(_.stringify(_schema));
    // > string(25)
    var buffer = _.pack(_schema, '你好世界！Hello');
    console.log(buffer.join(' '));
    // > 228 189 160 229 165 189 228 184 150 231 149 140 239 188 129 72 101 108 108 111 0 0 0 0 0
    console.log(_.unpack(_schema, buffer));
    // > 你好世界！Hello
   * @example stringCreator():dynamic
    var _ = jpacks;
    var _schema = _.string('int8');
    console.log(_.stringify(_schema));
    // > string('int8')
    var buffer = _.pack(_schema, '你好世界！Hello');
    console.log(buffer.join(' '));
    // > 20 228 189 160 229 165 189 228 184 150 231 149 140 239 188 129 72 101 108 108 111
    console.log(_.unpack(_schema, buffer));
    // > 你好世界！Hello
   '''<example>'''
   */
  function stringCreator(size) {
    // console.log('stringCreator', Schema.stringify(size));
    var schema = Schema.array('uint8', size);
    return new Schema({
      unpack: function _unpack(buffer, options, offsets) {
        var stringBuffer = Schema.unpack(schema, buffer, options, offsets);
        if (!options.browser && typeof Buffer !== 'undefined') { // NodeJS
          return new Buffer(stringBuffer).toString(options.encoding);
        }
        return decodeUTF8(String.fromCharCode.apply(String, stringBuffer));
      },
      pack: function _pack(value, options, buffer) {
        Schema.pack(schema, stringBytes(value, options), options, buffer);
      },
      namespace: 'string',
      args: arguments
    });
  }
  var string = Schema.together(stringCreator, function (fn, args) {
    fn.namespace = 'string';
    fn.args = args;
  });
  Schema.register('string', string);
  /**
   * 短字符串类型
   *
   * @return {Schema} 返回数据结构
   '''<example>'''
   * @example shortString
    ```js
    var _ = jpacks;
    var _schema = _.shortString;
    console.log(_.stringify(_schema));
    // > string(uint8)
    var buffer = _.pack(_schema, 'shortString');
    console.log(buffer.join(' '));
    // > 11 115 104 111 114 116 83 116 114 105 110 103
    console.log(_.unpack(_schema, buffer));
    // > shortString
    ```
   '''</example>'''
   */
  Schema.register('shortString', string('uint8'));
  /**
   * 长字符串类型
   *
   * @return {Schema} 返回数据结构
   '''<example>'''
   * @example smallString
    ```js
    var _ = jpacks;
    var _schema = _.smallString;
    console.log(_.stringify(_schema));
    // > string(uint16)
    var buffer = _.pack(_schema, 'smallString');
    console.log(buffer.join(' '));
    // > 0 11 115 109 97 108 108 83 116 114 105 110 103
    console.log(_.unpack(_schema, buffer));
    // > smallString
    ```
   '''</example>'''
   */
  Schema.register('smallString', string('uint16'));
  /**
   * 超长字符串类型
   *
   * @return {Schema} 返回数据结构
   '''<example>'''
   * @example longString
    ```js
    var _ = jpacks;
    var _schema = _.longString;
    console.log(_.stringify(_schema));
    // > string(uint32)
    var buffer = _.pack(_schema, 'longString');
    console.log(buffer.join(' '));
    // > 0 0 0 10 108 111 110 103 83 116 114 105 110 103
    console.log(_.unpack(_schema, buffer));
    // > longString
    ```
   '''</example>'''
   */
  Schema.register('longString', string('uint32'));
  /**
   * 以零号字符结尾的字符串
   *
   * @param {Schema|number} size 长度
   * @return {Schema} 返回 C 字符串结构
   '''<example>'''
   * @example cstringCreator():base
    ```js
    var _ = jpacks;
    var _schema = _.cstring(32);
    console.log(_.stringify(_schema));
    // > cstring(32)
    var buffer = _.pack(_schema, 'Hello 你好！');
    console.log(buffer.join(' '));
    // > 72 101 108 108 111 32 228 189 160 229 165 189 239 188 129 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > "Hello 你好！"
    ```
   * @example cstringCreator():auto size
    ```js
    var _ = jpacks;
    var _schema = _.cstring(null);
    console.log(_.stringify(_schema));
    // > cstring(null)
    var buffer = _.pack(_schema, 'Hello 你好！');
    console.log(buffer.join(' '));
    // > 72 101 108 108 111 32 228 189 160 229 165 189 239 188 129 0
    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > "Hello 你好！"
    ```
   * @example cstringCreator():pchar
    ```js
    var _ = jpacks;
    var _schema = _.array(_.pchar, 'uint8');
    console.log(_.stringify(_schema));
    // > array(cstring(null),'uint8')
    var buffer = _.pack(_schema, ['abc', 'defghijk', 'g']);
    console.log(buffer.join(' '));
    // > 3 97 98 99 0 100 101 102 103 104 105 106 107 0 103 0
    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > ["abc","defghijk","g"]
    ```
   '''</example>'''
   */
  function cstringCreator(size) {
    return new Schema({
      unpack: function _unpack(buffer, options, offsets) {
        var bytes;
        if (size === null) { // 自动大小
          bytes = new Uint8Array(buffer, offsets[0]);
        } else {
          bytes = Schema.unpack(Schema.bytes(size), buffer, options, offsets);
        }
        var byteSize = 0;
        while (bytes[byteSize]) {
          byteSize++;
        }
        var result = Schema.unpack(Schema.string(byteSize), bytes, options);
        if (size === null) {
          offsets[0] += byteSize + 1;
        }
        return result;
      },
      pack: function _pack(value, options, buffer) {
        var bytes = [0];
        [].unshift.apply(bytes, Schema.stringBytes(value, options)); // 追加零字符
        Schema.pack(Schema.bytes(size), bytes, options, buffer);
      },
      namespace: 'cstring',
      args: arguments
    });
  }
  var cstring = Schema.together(cstringCreator, function(fn, args) {
    fn.namespace = 'cstring';
    fn.args = args;
  });
  Schema.register('cstring', cstring);
  Schema.register('pchar', cstring(null));
  /**
   * 声明字段依赖结构
   *
   * @param {string} field 字段名
   * @param {Function} schemaCreator 创建数据结构的方法
   * [[[
   *    @param {Any} value 传递值
   *    @return {Schema} 返回数据结构
   *    function schemaCreator(value) {}
   * ]]]
   '''<example>'''
   * @example dependCreator():base
    ```js
    var _ = jpacks;
    var _schema = _.object({
      length1: 'int8',
      length2: 'int8',
      data1: _.depend('length1', _.bytes),
      data2: _.depend('length2', _.array(_.shortString))
    });
    console.log(_.stringify(_schema));
    // > object({length1:'int8',length2:'int8',data1:depend('length1','bytes'),data2:depend('length2',array(string('uint8')))})
    var buffer = _.pack(_schema, {
      length1: 2,
      length2: 3,
      data1: [1, 2],
      data2: ['甲', '乙', '丙']
    });
    console.log(buffer.join(' '));
    // > 2 3 1 2 3 231 148 178 3 228 185 153 3 228 184 153
    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > {"length1":2,"length2":3,"data1":[1,2],"data2":["甲","乙","丙"]}
    ```
   '''</example>'''
   */
  function dependCreator(field, schemaCreator) {
    /*<safe>*/
    if (typeof field !== 'string') {
      throw new Error('Parameter "field" must be a string.');
    }
    if (typeof schemaCreator !== 'function') {
      throw new Error('Parameter "field" must be a function.');
    }
    /*</safe>*/
    return new Schema({
      unpack: function _unpack(buffer, options, offsets) {
        /*<safe>*/
        if (!options.$scope) {
          throw new Error('Unpack must running in object.');
        }
        /*</safe>*/
        var fieldValue = options.$scope.target[field];
        /*<safe>*/
        if (typeof fieldValue === 'undefined') {
          throw new Error('Field "' + field + '" is undefined.');
        }
        /*</safe>*/
        return Schema.unpack(schemaCreator(fieldValue), buffer, options, offsets);
      },
      pack: function _pack(value, options, buffer) {
        var fieldValue = options.$scope.target[field];
        /*<safe>*/
        if (typeof fieldValue === 'undefined') {
          throw new Error('Field "' + field + '" is undefined.');
        }
        /*</safe>*/
        Schema.pack(schemaCreator(fieldValue), value, options, buffer);
      },
      namespace: 'depend',
      args: arguments
    });
  }
  var depend = Schema.together(dependCreator, function (fn, args) {
    fn.namespace = 'depend';
    fn.args = args;
  });
  Schema.register('depend', depend);
  function dependArray(field, itemSchema) {
    return depend(field, Schema.array(itemSchema));
  }
  Schema.register('dependArray', dependArray);
  /**
   * 构建解析类型，针对大小会改变的数据
   *
   * @param {Function} encode 编码器
   * @param {Function} decode 解码器
   * @param {string|Schema} 内容数据格式
   * @param {number|Schema} 大小或大小数据格式
   * @return {Schema} 返回解析类型
   '''<example>'''
   * @example parseCreator():_xor
    ```js
    var _ = jpacks;
    var _xor = function _xor(buffer) {
      return buffer.slice().map(function (item) {
        return item ^ 127;
      });
    };
    var _schema = _.parse(_xor, _xor, 'float64', 8);
    console.log(_.stringify(_schema));
    // > parse('_xor','_xor','float64',8)
    var buffer = _.pack(_schema, 2.94296650666094e+189);
    console.log(buffer.join(' '));
    // > 111 75 41 7 126 92 58 24
    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > 2.94296650666094e+189
    ```
   '''</example>'''
   */
  function parseCreator(encode, decode, dataSchema, size) {
    /*<safe>*/
    if (typeof encode !== 'function') {
      throw new Error('Parameter "compress" must be a function.');
    }
    if (typeof decode !== 'function') {
      throw new Error('Parameter "decompress" must be a function.');
    }
    /*</safe>*/
    var schema = Schema.bytes(size);
    return new Schema({
      unpack: function _unpack(buffer, options, offsets) {
        var bytes = decode(Schema.unpack(schema, buffer, options, offsets));
        return Schema.unpack(dataSchema, bytes, options);
      },
      pack: function _pack(value, options, buffer) {
        var bytes = encode(Schema.pack(dataSchema, value, options));
        Schema.pack(schema, bytes, options, buffer);
      },
      namespace: 'parse',
      args: arguments
    });
  }
  var parse = Schema.together(parseCreator, function (fn, args) {
    fn.namespace = 'parse';
    fn.args = args;
  });
  Schema.register('parse', parse);
  /**
   * 定义一个虚拟结构
   *
   * @param {number|string} operator
   * @param {object} value 数据结构
   '''<example>'''
   * @example virtualCreator:number
    ```js
    var _ = jpacks;
    var _schema = _.object({
      f1: 'uint16',
      v1: _.depend('f1', _.virtual(-4))
    });
    console.log(_.stringify(_schema))
    // > object({f1:'uint16',v1:depend('f1',virtual(-4))})
    var buffer = _.pack(_schema, {
      f1: 4
    });
    console.log(buffer.join(' '));
    // > 4 0
    console.log(JSON.stringify(_.unpack(_schema, buffer, { littleEndian: false })));
    // > {"f1":1024,"v1":1020}
    ```
   * @example virtualCreator:string
    ```js
    var _ = jpacks;
    var _schema = _.object({
      name: _.shortString,
      welcome: _.depend('name', _.virtual('Hello '))
    });
    console.log(_.stringify(_schema))
    // > object({name:string('uint8'),welcome:depend('name',virtual('Hello '))})
    var buffer = _.pack(_schema, {
      name: 'World!'
    });
    console.log(buffer.join(' '));
    // > 6 87 111 114 108 100 33
    console.log(JSON.stringify(_.unpack(_schema, buffer, { littleEndian: false })));
    // > {"name":"World!","welcome":"Hello World!"}
    ```
   * @example virtualCreator:depend
    ```js
    var _ = jpacks;
    var _schema = _.object({
      name: _.shortString,
      welcome: _.depend('name', function (name) {
        switch (name) {
          case 'zswang':
            return _.depend('name', _.virtual('Hello '));
          case 'wang':
            return _.depend('name', _.virtual('Hi '));
        }
      })
    });
    console.log(_.stringify(_schema))
    // > object({name:string('uint8'),welcome:depend('name',$fn)})
    var buffer = _.pack(_schema, {
      name: 'zswang'
    });
    console.log(buffer.join(' '));
    // > 6 122 115 119 97 110 103
    console.log(JSON.stringify(_.unpack(_schema, buffer, { littleEndian: false })));
    // > {"name":"zswang","welcome":"Hello zswang"}
    var buffer = _.pack(_schema, {
      name: 'wang'
    });
    console.log(buffer.join(' '));
    // > 4 119 97 110 103
    console.log(JSON.stringify(_.unpack(_schema, buffer, { littleEndian: false })));
    // > {"name":"wang","welcome":"Hi wang"}
   ```
   '''</example>'''
   */
  function virtualCreator(operator, value) {
    return new Schema({
      unpack: function _unpack() {
        if (/string|number/.test(typeof operator)) {
          return operator + value;
        }
        if (typeof operator === 'function') {
          return operator(value);
        }
        return value;
      },
      pack: function _pack() {},
      args: arguments,
      namespace: 'virtual'
    });
  }
  var virtual = Schema.together(virtualCreator, function (fn, args) {
    fn.namespace = 'virtual';
    fn.args = args;
  });
  Schema.register('virtual', virtual);
  /**
   * 声明映射文件
   *
   * @param {string} field 字段名，即：元素的个数
   * @param {string|Schema} item 元素类型
   * @return {Schema|Function} 返回数据结构
   '''<example>'''
   * @example linkCreator():base
    ```js
    var _ = jpacks;
    var _schema = {
      size1: 'uint16',
      size2: 'uint16',
      data1: _.link('size1', 'uint8'),
      data2: _.link('size2', 'uint8')
    };
    console.log(_.stringify(_schema));
    // > {size1:'uint16',size2:'uint16',data1:link('size1','uint8'),data2:link('size2','uint8')}
    var buffer = jpacks.pack(_schema, {
      data1: [1, 2, 3, 4],
      data2: [1, 2, 3, 4, 5, 6, 7, 8],
    });
    console.log(buffer.join(' '));
    // > 4 0 8 0 1 2 3 4 1 2 3 4 5 6 7 8
    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > {"size1":4,"size2":8,"data1":[1,2,3,4],"data2":[1,2,3,4,5,6,7,8]}
    ```
   '''</example>'''
   */
  function linkCreator(field, item) {
    /*<safe>*/
    if (typeof field !== 'string') {
      throw new Error('Parameter "field" must be a string.');
    }
    /*</safe>*/
    /*<safe>*/
    if (typeof item === 'undefined') {
      throw new Error('Parameter "item" is undefined.');
    }
    /*</safe>*/
    return new Schema({
      unpack: function _unpack(buffer, options, offsets) {
        /*<safe>*/
        if (!options.$scope) {
          throw new Error('Unpack must running in object.');
        }
        /*</safe>*/
        var fieldValue = options.$scope.target[field];
        var itemSchema = Schema.from(item);
        /*<safe>*/
        if (typeof fieldValue === 'undefined') {
          throw new Error('Field "' + field + '" is undefined.');
        }
        /*</safe>*/
        return Schema.unpack(Schema.array(itemSchema, fieldValue), buffer, options, offsets);
      },
      pack: function _pack(value, options, buffer) {
        var fieldSchema = options.$scope.schema[field];
        /*<safe>*/
        if (typeof fieldSchema === 'undefined') {
          throw new Error('Field schema "' + field + '" is undefined.');
        }
        /*</safe>*/
        var itemSchema = Schema.from(item);
        var bytes = Schema.pack(fieldSchema, value.length, options);
        var offset = options.$scope.offsets[field];
        for (var i = 0; i < bytes.length; i++) {
          buffer[offset + i] = bytes[i];
        }
        Schema.pack(Schema.array(itemSchema, null), value, options, buffer);
      },
      namespace: 'link',
      args: arguments
    });
  }
  var link = Schema.together(linkCreator, function (fn, args) {
    fn.namespace = 'link';
    fn.args = args;
  });
  Schema.register('link', link);
  function linkArray(field, itemSchema) {
    return link(field, Schema.array(itemSchema));
  }
  Schema.register('linkArray', linkArray);
    return Schema;
  }
  var root = create();
  root.create = create;
  var exports = root;
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