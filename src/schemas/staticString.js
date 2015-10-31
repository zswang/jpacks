module.exports = function defineStaticString(Schema) {
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
  /*</define>*/
};