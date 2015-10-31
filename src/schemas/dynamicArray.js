module.exports = function defineDynamicArray(Schema) {
  /*<define>*/
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
  /*</define>*/
};