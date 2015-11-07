module.exports = function(Schema) {
  /*<define>*/
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
  /*</define>*/
};