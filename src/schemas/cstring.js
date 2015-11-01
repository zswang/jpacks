module.exports = function (Schema) {
  /*<define>*/
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
    schema: 'cstring'
  });
  Schema.register('cstring', cstring);
  Schema.register('pchar', cstring);
  /*</define>*/
};