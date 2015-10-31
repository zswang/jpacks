module.exports = function defineArray(Schema) {
  /*<define>*/
  /**
   * 声明数组类型
   *
   * @param {string|Schema} itemSchema 数组元素类型
   * @param {number} count 元素个数
   * @return {Schema} 返回数据结构
   * @example 调用示例 1
    ```js
    var _ = jpacks;
    var _schema = _.array(10, _.byte);
    var ab = _.pack(_.array(10, _.byte), [1, 2, 3, 4]);
    var u8a = new Uint8Array(ab);
    console.log(u8a);
    // -> [1, 2, 3, 4, 0, 0, 0, 0, 0, 0]

    console.log(_.unpack(_schema, u8a));
    // -> [1, 2, 3, 4, 0, 0, 0, 0, 0, 0]
    ```
   */
  function array(count, itemSchema) {
    if (typeof count !== 'number') {
      var temp = count;
      count = itemSchema;
      itemSchema = temp;
    }
    var schema = Schema.from(itemSchema);
    if (!schema) {
      throw new Error('Schema "' + itemSchema + '" not define.');
    }

    var size = schema.size * count;

    return new Schema({
      unpack: function _unpack(buffer, options, offsets) {
        if (schema.array && options.littleEndian) {
          /* TypeArray littleEndian is true */
          var offset = offsets[0];
          offsets[0] += size;
          return [].slice.apply(new schema.array(buffer, offset, count));
        }

        var result = [];
        for (var i = 0; i < count; i++) {
          result.push(Schema.unpack(schema, buffer, options, offsets));
        }
        return result;
      },
      pack: function _pack(value, options, buffer) {
        if (schema.array && options.littleEndian) {
          /* TypeArray littleEndian is true */
          var arrayBuffer = new ArrayBuffer(size);
          var typeArray = new schema.array(arrayBuffer);
          typeArray.set(value);
          var uint8Array = new Uint8Array(arrayBuffer);
          [].push.apply(buffer, uint8Array);
        }

        for (var i = 0; i < count; i++) {
          Schema.pack(schema, value[i], options, buffer);
        }
      },
      name: schema.name + '[' + count + ']',
      size: size,
      namespace: 'array'
    });
  }

  Schema.register('array', array);
  Schema.register('staticArray', array);

  function bytes(size) {
    return array(size, 'uint8');
  }
  Schema.register('bytes', bytes);

  Schema.pushPattern(function (schema) {
    if (typeof schema === 'string') {
      var match = schema.match(/^(\w+)\[(\d+)\]$/);
      if (match) {
        var baseSchema = Schema.from(match[1]);
        if (baseSchema) {
          var arraySchema = array(parseInt(match[2]), baseSchema);
          Schema.register(schema, arraySchema); // 缓存
          return arraySchema;
        }
      }
    }
  });
  /*</define>*/
};