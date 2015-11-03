module.exports = function (Schema) {
  /*<define>*/
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
   '''<example>'''
   '''<example>'''
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
  /*</define>*/
};