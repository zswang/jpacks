module.exports = function(Schema) {
  /*<define>*/
  /**
   * 以零号字符结尾的字符串
   *
   * @param {Schema|number} size 长度
   * @return {Schema} 返回 C 字符串结构
   '''<example>'''
   * @example cstring
    ```js
    var _ = jpacks;
    var _schema = _.cstring(32);
    console.log(_.stringify(_schema));
    // -> cstring

    var buffer = _.pack(_schema, 'Hello 你好！');
    console.log(buffer.join(' '));
    // -> 72 101 108 108 111 32 228 189 160 229 165 189 239 188 129 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0

    console.log(_.unpack(_schema, buffer));
    // -> Hello 你好！
    ```
   '''</example>'''
   */
  function cstringCreator(size) {
    if (size === true) {
      return new Schema({
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
        schema: 'cstring'
      });
    }
    return new Schema({
      unpack: function _unpack(buffer, options, offsets) {
        var bytes = Schema.unpack(Schema.bytes(size), buffer, options, offsets);
        var byteSize = 0;
        while (bytes[byteSize]) {
          byteSize++;
        }
        return Schema.unpack(Schema.string(byteSize), bytes, options);
      },
      pack: function _pack(value, options, buffer) {
        Schema.pack(Schema.bytes(size), Schema.stringBytes(value), options, buffer);
        Schema.pack('byte', 0, options, buffer);
      },
      namespace: 'cstring',
      schema: 'cstring'
    });
  }
  var cstring = Schema.together(cstringCreator, function (fn, args) {
    fn.namespace = 'cstring';
    fn.args = args;
  });
  Schema.register('cstring', cstring);
  Schema.register('pchar', cstring(true));
  /*</define>*/
};