module.exports = function(Schema) {
  /*<define>*/
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
  /*</define>*/
};