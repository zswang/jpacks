(function (exportName) {
  /**
   * @file jpacks
   *
   * Binary data packing and unpacking.
   * @author
   *   zswang (http://weibo.com/zswang)
   * @version 0.1.0
   * @date 2015-11-01
   */
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
  var defaultLittleEndian;
  /**
   * 设置默认低字节序
   *
   * @param {boolean} value 默认值
   */
  function setDefaultLittleEndian(value) {
    defaultLittleEndian = value;
  }
  Schema.setDefaultLittleEndian = setDefaultLittleEndian;
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
    if (typeof options.littleEndian === 'undefined') {
      options.littleEndian = defaultLittleEndian;
    }
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
    if (typeof options.littleEndian === 'undefined') {
      options.littleEndian = defaultLittleEndian;
    }
    schema.pack(data, options, buffer);
    return buffer;
  }
  Schema.pack = pack;
  /**
   * 基础类型
   *
   * @type {Object}
   *   @key 基础类型名称
   *   @value
   *       @field {string} type 对应 DataView 类型名
   *       @field {number} size 数据大小，单位 byte
   *       @field {Array of string} alias 别名
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
      namespace: 'base',
      array: item.array
    });
    Schema.register(name, schema);
    (item.alias || []).forEach(function (alias) {
      Schema.register(alias, schema);
    });
  });
  /**
   * 声明数组类型
   *
   * @param {string|Schema} itemSchema 数组元素类型
   * @param {number} count 元素个数
   * @return {Schema} 返回数据结构
   * @example 调用示例 1
    ```js
    var _ = jpacks;
    var _schema = _.array(10, _.byte);
    var ab = _.pack(_.array(10, _.byte), [1, 2, 3, 4]);
    var u8a = new Uint8Array(ab);
    console.log(u8a);
    // -> [1, 2, 3, 4, 0, 0, 0, 0, 0, 0]
    console.log(_.unpack(_schema, u8a));
    // -> [1, 2, 3, 4, 0, 0, 0, 0, 0, 0]
    ```
   */
  function array(count, itemSchema) {
    if (typeof count !== 'number') {
      var temp = count;
      count = itemSchema;
      itemSchema = temp;
    }
    var schema = Schema.from(itemSchema);
    if (!schema) {
      throw new Error('Schema "' + itemSchema + '" not define.');
    }
    var size = schema.size * count;
    return new Schema({
      unpack: function _unpack(buffer, options, offsets) {
        if (schema.array && options.littleEndian) {
          /* TypeArray littleEndian is true */
          var offset = offsets[0];
          offsets[0] += size;
          return [].slice.apply(new schema.array(buffer, offset, count));
        }
        var result = [];
        for (var i = 0; i < count; i++) {
          result.push(Schema.unpack(schema, buffer, options, offsets));
        }
        return result;
      },
      pack: function _pack(value, options, buffer) {
        if (schema.array && options.littleEndian) {
          /* TypeArray littleEndian is true */
          var arrayBuffer = new ArrayBuffer(size);
          var typeArray = new schema.array(arrayBuffer);
          typeArray.set(value);
          var uint8Array = new Uint8Array(arrayBuffer);
          [].push.apply(buffer, uint8Array);
        }
        for (var i = 0; i < count; i++) {
          Schema.pack(schema, value[i], options, buffer);
        }
      },
      name: schema.name + '[' + count + ']',
      size: size,
      namespace: 'array'
    });
  }
  Schema.register('array', array);
  Schema.register('staticArray', array);
  function bytes(size) {
    return array(size, 'uint8');
  }
  Schema.register('bytes', bytes);
  Schema.pushPattern(function (schema) {
    if (typeof schema === 'string') {
      var match = schema.match(/^(\w+)\[(\d+)\]$/);
      if (match) {
        var baseSchema = Schema.from(match[1]);
        if (baseSchema) {
          var arraySchema = array(parseInt(match[2]), baseSchema);
          Schema.register(schema, arraySchema); // 缓存
          return arraySchema;
        }
      }
    }
  });
  /**
   * 声明指定长度的数组类型
   *
   * @param {string|Schema} lengthSchema 长度类型
   * @param {string|Schema} itemSchema 元素类型
   * @return {Schema} 返回数据结构
   * @example 调用示例 1
    ```js
    var _ = jpacks;
    var _schema = _.dynamicArray(_.byte, _.byte);
    var ab = _.pack(_schema, [1, 2, 3, 4]);
    var u8a = new Uint8Array(ab);
    console.log(u8a);
    // -> [4, 1, 2, 3, 4]
    console.log(_.unpack(_schema, u8a));
    // -> [1, 2, 3, 4]
    ```
   * @example 调用示例 2
    ```js
    var _ = jpacks;
    var _schema = _.dynamicArray(_.word, _.byte);
    var ab = _.pack(_schema, [1, 2, 3, 4]);
    var u8a = new Uint8Array(ab);
    console.log(u8a);
    // -> [0, 0, 0, 4, 1, 2, 3, 4]
    console.log(_.unpack(_schema, u8a));
    // -> [1, 2, 3, 4]
    ```
   */
  function dynamicArray(lengthSchema, itemSchema) {
    lengthSchema = Schema.from(lengthSchema);
    if (lengthSchema.namespace !== 'base') {
      throw new Error('Parameter "lengthSchema" is not a numeric type.');
    }
    if (!itemSchema) {
      throw new Error('Parameter "itemSchema" is undefined.');
    }
    return new Schema({
      unpack: function _unpack(buffer, options, offsets) {
        var length = Schema.unpack(lengthSchema, buffer, options, offsets);
        return Schema.unpack(Schema.array(length, itemSchema), buffer, options, offsets);
      },
      pack: function _pack(value, options, buffer) {
        if (!value) {
          Schema.pack(lengthSchema, 0, options, buffer);
        } else {
          Schema.pack(lengthSchema, value.length, options, buffer);
          Schema.pack(Schema.array(value.length, itemSchema), value, options, buffer);
        }
      },
      name: 'dynamic array[..' + lengthSchema.name + '..]',
      namespace: 'dynamicArray',
      size: lengthSchema.size
    });
  }
  Schema.register('dynamicArray', dynamicArray);
  function shortArray(schema) {
    return dynamicArray('uint8', schema);
  }
  Schema.register('shortArray', shortArray);
  function smallArray(schema) {
    return dynamicArray('uint16', schema);
  }
  Schema.register('smallArray', smallArray);
  function longArray(schema) {
    return dynamicArray('uint32', schema);
  }
  Schema.register('longArray', longArray);
  // 'int8[.]'         - shortArray
  // 'int8[..]' - smallArray
  // 'int8[....]'      - longArray
  Schema.pushPattern(function (schema) {
    if (typeof schema === 'string') {
      var match = schema.match(/^(\w+)\[(\.|\..|\....)\]$/);
      if (match) {
        var baseSchema = Schema.from(match[1]);
        if (baseSchema) {
          var lengthSchema = 'uint16';
          switch (match[2]) {
          case '.':
            lengthSchema = 'uint8'
            break;
          case '....':
            lengthSchema = 'uint32'
            break;
          }
          var arraySchema = dynamicArray(lengthSchema, baseSchema);
          Schema.register(schema, arraySchema); // 缓存
          return arraySchema;
        }
      }
    }
  });
  /**
   * 定义一个对象结构
   *
   * @param {object} schema 数据结构
   * @return {Schema} 返回构建的数据结构
   */
  function object(schema) {
    if (typeof schema !== 'object') {
      throw new Error('Parameter "schemas" must be a object type.');
    }
    if (schema instanceof Schema) {
      return schema;
    }
    return new Schema({
      unpack: function _unpack(buffer, options, offsets) {
        var result = {};
        var $scope = options.$scope;
        options.$scope = result;
        Object.keys(schema).forEach(function (key) {
          result[key] = Schema.unpack(schema[key], buffer, options, offsets);
        });
        options.$scope = $scope;
        return result;
      },
      pack: function _pack(value, options, buffer) {
        var $scope = options.$scope;
        options.$scope = value;
        Object.keys(schema).forEach(function (key) {
          Schema.pack(schema[key], value[key], options, buffer);
        });
        options.$scope = $scope;
      },
      object: schema,
      name: 'object {}'
    });
  };
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
   * @example 调用示例
    ```js
    var _ = jpacks;
    var _schema = _.union(20, {
      length: _.byte,
      content: _.shortString
    });
    var ab = _.pack(_schema, {
      content: '0123456789'
    });
    var u8a = new Uint8Array(ab);
    console.log(u8a);
    // -> [10, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    console.log(_.unpack(_schema, u8a));
    // -> Object {length: 10, content: "0123456789"}
    ```
   */
  function union(size, schemas) {
    if (typeof size !== 'number') {
      var temp = size;
      size = schemas;
      schemas = temp;
    }
    if (typeof size !== 'number') {
      throw new Error('Parameter "size" must be a numeric type.');
    }
    if (typeof schemas !== 'object') {
      throw new Error('Parameter "schemas" must be a object type.');
    }
    if (schemas instanceof Schema) {
      throw new Error('Parameter "schemas" cannot be a Schema object.');
    }
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
          var temp = [];
          Schema.pack(schemas[key], value[key], options, temp);
          uint8Array.set(temp);
        });
        [].push.apply(buffer, uint8Array);
      },
      size: size,
      object: schemas,
      name: 'union {}'
    });
  }
  Schema.register('union', union);
  /**
   * 创建条件类型
   *
   * @param {Object} schemas 条件类型结构，第一个字段为条件字段，其他字段为数组。数组第一元素表示命中条件，第二位类型
   * @return {Schema} 返回联合类型
   * @example 调用示例 1
    ```js
    var _ = jpacks;
    var _schema = _.cases({
      type: _.shortString,
      name: ['name', _.shortString],
      age: ['age', _.byte]
    });
    var ab = _.pack(_schema, {
      type: 'name',
      name: 'tom'
    });
    var u8a = new Uint8Array(ab);
    console.log(u8a);
    // -> [4, 110, 97, 109, 101, 3, 116, 111, 109]
    console.log(_.unpack(_schema, u8a));
    // -> Object {type: "name", name: "tom"}
    var ab2 = _.pack(_schema, {
      type: 'age',
      age: 23
    });
    var u8a2 = new Uint8Array(ab2);
    console.log(u8a2);
    // -> [3, 97, 103, 101, 23]
    console.log(_.unpack(_schema, u8a2));
    // -> Object {type: "age", age: 23}
    ```
  */
  function cases(schemas) {
    if (typeof schemas !== 'object') {
      throw new Error('Parameter "schemas" must be a object type.');
    }
    if (schemas instanceof Schema) {
      throw new Error('Parameter "schemas" cannot be a Schema object.');
    }
    var keys = Object.keys(schemas);
    var patternName = keys[0];
    var patternSchema = schemas[patternName];
    keys = keys.slice(1);
    return new Schema({
      unpack: function _unpack(buffer, options, offsets) {
        var result = {};
        var patternValue = Schema.unpack(patternSchema, buffer, options, offsets);
        result[patternName] = patternValue;
        keys.every(function (key) {
          if (patternValue === schemas[key][0]) {
            result[key] = Schema.unpack(schemas[key][1], buffer, options, offsets);
            return false;
          }
          return true;
        });
        return result;
      },
      pack: function _pack(value, options, buffer) {
        var patternValue = value[patternName];
        Schema.pack(patternSchema, patternValue, options, buffer);
        keys.every(function (key) {
          if (patternValue === schemas[key][0]) {
            Schema.pack(schemas[key][1], value[key], options, buffer);
            return false;
          }
          return true;
        });
      },
      name: 'cases{' + patternName + '}',
      namespace: 'cases'
    });
  }
  Schema.register('cases', cases);
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
  }
  /**
   * 将字符串转换为字节数组
   *
   * @param {string} value 字符串内容
   * @param {string=} encoding 编码类型，仅在 NodeJS 下生效，默认 'utf-8'
   * @return {Array} 返回字节数组
   */
  function stringBytes(value, encoding) {
    if (typeof Buffer !== 'undefined') { // NodeJS
      return new Buffer(value, encoding);
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
   * @param {number} size 字节个数
   * @return {Schema} 返回数据结构
   */
  function string(size) {
    var schema = Schema.array(size, 'uint8');
    return new Schema({
      unpack: function _unpack(buffer, options, offsets) {
        var stringBuffer = Schema.unpack(schema, buffer, options, offsets);
        if (typeof Buffer !== 'undefined') { // NodeJS
          return new Buffer(stringBuffer).toString();
        }
        return decodeUTF8(String.fromCharCode.apply(String, stringBuffer));
      },
      pack: function _pack(value, options, buffer) {
        Schema.pack(schema, stringBytes(value), options, buffer);
      },
      namespace: 'staticString',
      name: 'string{' + size + '}',
      size: size
    });
  }
  Schema.register('string', string);
  Schema.register('staticString', string);
  Schema.pushPattern(function (schema) {
    if (typeof schema === 'string') {
      var match = schema.match(/^string\{(\d+)\}$/);
      if (match) {
        var arraySchema = string(parseInt(match[1]));
        Schema.register(schema, arraySchema); // 缓存
        return arraySchema;
      }
    }
  });
  /**
   * 声明指定长度的字符串
   *
   * @param {string|Schema} lengthSchema 长度类型
   * @return {Schema} 返回数据结构
   * @example 调用示例
    ```js
    var _ = jpacks;
    var _schema = _.dynamicString('int32');
    var ab = _.pack(_schema, '你好 World!');
    var u8a = new Uint8Array(ab);
    console.log(u8a);
    // -> [0, 0, 0, 13, 228, 189, 160, 229, 165, 189, 32, 87, 111, 114, 108, 100, 33]
    console.log(_.unpack(_schema, u8a));
    // -> 你好 World!
    ```
   */
  function dynamicString(lengthSchema) {
    lengthSchema = Schema.from(lengthSchema);
    if (!lengthSchema) {
      throw new Error('Parameter "lengthSchema" is undefined.');
    }
    if (lengthSchema.namespace !== 'base') {
      throw new Error('Parameter "lengthSchema" is not a numeric type.');
    }
    return new Schema({
      unpack: function _unpack(buffer, options, offsets) {
        var length = Schema.unpack(lengthSchema, buffer, options, offsets);
        return Schema.unpack(Schema.string(length), buffer, options, offsets);
      },
      pack: function _pack(value, options, buffer) {
        if (!value) {
          Schema.pack(lengthSchema, 0, options, buffer);
        } else {
          var bytes = Schema.stringBytes(value);
          Schema.pack(lengthSchema, bytes.length, options, buffer);
          Schema.pack(Schema.bytes(bytes.length), bytes, options, buffer);
        }
      },
      namespace: 'dynamicString',
      name: 'string{..' + lengthSchema.name + '..}'
    });
  }
  Schema.register('dynamicString', dynamicString);
  /**
   * 短字符串类型
   *
   * @return {Schema} 返回数据结构
   * @example 调用示例
    ```js
    var _ = jpacks;
    var _schema = _.shortString;
    var ab = _.pack(_schema, '你好 World!');
    var u8a = new Uint8Array(ab);
    console.log(u8a);
    // -> [13, 228, 189, 160, 229, 165, 189, 32, 87, 111, 114, 108, 100, 33]
    console.log(_.unpack(_schema, u8a));
    // -> 你好 World!
    ```
   */
  Schema.register('shortString', dynamicString('uint8'));
  /**
   * 长字符串类型
   *
   * @return {Schema} 返回数据结构
   * @example 调用示例
    ```js
    var _ = jpacks;
    var _schema = _.smallString;
    var ab = _.pack(_schema, '你好 World!');
    var u8a = new Uint8Array(ab);
    console.log(u8a);
    // -> [0, 13, 228, 189, 160, 229, 165, 189, 32, 87, 111, 114, 108, 100, 33]
    console.log(_.unpack(_schema, u8a));
    // -> 你好 World!
    ```
   */
  Schema.register('smallString', dynamicString('uint16'));
  /**
   * 长字符串类型
   *
   * @return {Schema} 返回数据结构
   * @example 调用示例
    ```js
    var _ = jpacks;
    var _schema = _.longString;
    var ab = _.pack(_schema, '你好 World!');
    var u8a = new Uint8Array(ab);
    console.log(u8a);
    // -> [0, 0, 0, 13, 228, 189, 160, 229, 165, 189, 32, 87, 111, 114, 108, 100, 33]
    console.log(_.unpack(_schema, u8a));
    // -> 你好 World!
    ```
   */
  Schema.register('longString', dynamicString('uint32'));
  function dependArray(field, itemSchema) {
    if (typeof field !== 'string') {
      throw new Error('Parameter "field" must be a string.');
    }
    return new Schema({
      unpack: function _unpack(buffer, options, offsets) {
        if (!options.$scope) {
          throw new Error('Unpack must running in object.');
        }
        var length = options.$scope[field];
        if (typeof length !== 'number') {
          throw new Error('Field "' + field + '" must be a number.');
        }
        return Schema.unpack(Schema.staticArray(length, itemSchema), buffer, options, offsets);
      },
      pack: function _pack(value, options, buffer) {
        var length = options.$scope[field];
        if (typeof length !== 'number') {
          throw new Error('Field "' + field + '" must be a number.');
        }
        Schema.pack(Schema.array(length, itemSchema), value, options, buffer);
      },
      name: 'depend array{' + field + '}',
      namespace: 'dependArray'
    });
  }
  Schema.register('dependArray', dependArray);
  function dependString(field, itemSchema) {
    if (typeof field !== 'string') {
      throw new Error('Parameter "field" must be a string.');
    }
    return new Schema({
      unpack: function _unpack(buffer, options, offsets) {
        if (!options.$scope) {
          throw new Error('Unpack must running in object.');
        }
        var size = options.$scope[field];
        if (typeof size !== 'number') {
          throw new Error('Field "' + field + '" must be a number.');
        }
        return Schema.unpack(Schema.staticString(size, itemSchema), buffer, options, offsets);
      },
      pack: function _pack(value, options, buffer) {
        var size = options.$scope[field];
        if (typeof size !== 'number') {
          throw new Error('Field "' + field + '" must be a number.');
        }
        Schema.pack(Schema.string(size), value, options, buffer);
      },
      name: 'depend string{' + field + '}',
      namespace: 'dependString'
    });
  }
  Schema.register('dependString', dependString);
  /**
   * 定义一个枚举结构
   *
   * @param {Schema} baseSchema 枚举结构的基础类型
   * @param {Array|Object} map 枚举类型字典
   * @return {Schema} 返回构建的数据结构
   */
  function enums(baseSchema, map) {
    baseSchema = Schema.from(baseSchema);
    if (!baseSchema) {
      throw new Error('Parameter "baseSchema" is undefined.');
    }
    if (baseSchema.namespace !== 'base') {
      throw new Error('Parameter "baseSchema" is not a numeric type.');
    }
    if (typeof map !== 'object') {
      throw new Error('Parameter "map" must be a object type.');
    }
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
        return result;
      },
      pack: function _pack(value, options, buffer) {
        if (keys.every(function (key) {
          if (key === value) {
            Schema.pack(baseSchema, map[key], options, buffer);
            return false;
          }
          return true;
        })) {
          throw new Error('Not find enum "' + value + '".');
        };
      },
      map: map,
      name: 'enum {}'
    });
  };
  Schema.register('enums', enums);
  /**
   * 以零号字符结尾的字符串
   *
   * @type {Schema}
   * @example 调用示例 1
    ```js
    var _ = jpacks;
    var _schema = _.cstring;
    var ab = _.pack(_schema, 'Hello 你好！');
    var u8a = new Uint8Array(ab);
    console.log(u8a);
    // -> [72, 101, 108, 108, 111, 32, 228, 189, 160, 229, 165, 189, 239, 188, 129, 0]
    console.log(_.unpack(_schema, u8a));
    // -> Hello 你好！
    ```
     */
  var cstring = new Schema({
    unpack: function _unpack(buffer, options, offsets) {
      var uint8Array = new Uint8Array(buffer, offsets[0]);
      var size = 0;
      while (uint8Array[size]) {
        size++;
      }
      var result = Schema.unpack(Schema.string(size), buffer, options, offsets);
      offsets[0]++;
      return result;
    },
    pack: function _pack(value, options, buffer) {
      var bytes = Schema.stringBytes(value);
      Schema.pack(Schema.bytes(bytes.length), bytes, options, buffer);
      Schema.pack('byte', 0, options, buffer);
    },
    namespace: 'cstring',
    name: 'cstring'
  });
  Schema.register('cstring', cstring);
  Schema.register('pchar', cstring);
  var exports = Schema;
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