module.exports = function defineUnion(Schema) {
  /*<define>*/
  /**
   * 创建联合类型
   *
   * @param {number} size 联合类型总大小
   * @param {Object} schema 联合类型中出现的字段
   * @return {Schema} 返回联合类型
   * @example 调用示例
    ```js
    var _ = jpacks;
    var _schema = _.union(20, {
      length: _.byte,
      content: _.shortString
    });
    var ab = _.pack(_schema, {
      content: '0123456789'
    });
    var u8a = new Uint8Array(ab);
    console.log(u8a);
    // -> [10, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 0, 0, 0, 0, 0, 0, 0, 0, 0]

    console.log(_.unpack(_schema, u8a));
    // -> Object {length: 10, content: "0123456789"}
    ```
   */
  function union(size, schemas) {
    if (typeof size !== 'number') {
      var temp = size;
      size = schemas;
      schemas = temp;
    }

    if (typeof size !== 'number') {
      throw new Error('Parameter "size" must be a numeric type.');
    }
    if (typeof schemas !== 'object') {
      throw new Error('Parameter "schemas" must be a object type.');
    }
    if (schemas instanceof Schema) {
      throw new Error('Parameter "schemas" cannot be a Schema object.');
    }
    var keys = Object.keys(schemas);
    return new Schema({
      unpack: function _unpack(buffer, options, offsets) {
        var beginOffset = offsets[0];
        var result = {};
        keys.forEach(function (key) {
          offsets[0] = beginOffset;
          result[key] = Schema.unpack(schemas[key], buffer, options, offsets);
        });
        offsets[0] += size;
        return result;
      },
      pack: function _pack(value, options, buffer) {
        var arrayBuffer = new ArrayBuffer(size);
        var uint8Array = new Uint8Array(arrayBuffer);
        keys.forEach(function (key) {
          var temp = [];
          Schema.pack(schemas[key], value[key], options, temp);
          uint8Array.set(temp);
        });
        [].push.apply(buffer, uint8Array);
      },
      size: size,
      object: schemas,
      name: 'union {}'
    });
  }
  Schema.register('union', union);
  /*</define>*/
};