function createSchema() {
  /*<define>*/
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
  /*</define>*/

  return Schema;
}

module.exports = createSchema();