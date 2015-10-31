module.exports = function defineDynamicString(Schema) {
  /*<define>*/
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
  /*</define>*/
};