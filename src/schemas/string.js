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

  /**
   * 声明指定长度的字符串
   *
   * @param {number|string|Schema} size 字节个数下标类型
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
      namespace: 'string',
      name: 'string(' + Schema.stringify(size) + ')',
      size: size
    });
  }
  Schema.register('string', string);

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
  Schema.register('shortString', string('uint8'));
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
  Schema.register('smallString', string('uint16'));
  /**
   * 超长字符串类型
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
  Schema.register('longString', string('uint32'));
  /*</define>*/
};