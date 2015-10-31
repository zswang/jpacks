module.exports = function defineCases(Schema) {
  /*<define>*/
  /**
   * 创建条件类型
   *
   * @param {Object} schemas 条件类型结构，第一个字段为条件字段，其他字段为数组。数组第一元素表示命中条件，第二位类型
   * @return {Schema} 返回联合类型
   * @example 调用示例 1
    ```js
    var _ = jpacks;
    var _schema = _.cases({
      type: _.shortString,
      name: ['name', _.shortString],
      age: ['age', _.byte]
    });
    var ab = _.pack(_schema, {
      type: 'name',
      name: 'tom'
    });
    var u8a = new Uint8Array(ab);
    console.log(u8a);
    // -> [4, 110, 97, 109, 101, 3, 116, 111, 109]

    console.log(_.unpack(_schema, u8a));
    // -> Object {type: "name", name: "tom"}

    var ab2 = _.pack(_schema, {
      type: 'age',
      age: 23
    });
    var u8a2 = new Uint8Array(ab2);
    console.log(u8a2);
    // -> [3, 97, 103, 101, 23]

    console.log(_.unpack(_schema, u8a2));
    // -> Object {type: "age", age: 23}
    ```
  */
  function cases(schemas) {
    if (typeof schemas !== 'object') {
      throw new Error('Parameter "schemas" must be a object type.');
    }
    if (schemas instanceof Schema) {
      throw new Error('Parameter "schemas" cannot be a Schema object.');
    }

    var keys = Object.keys(schemas);
    var patternName = keys[0];
    var patternSchema = schemas[patternName];
    keys = keys.slice(1);
    return new Schema({
      unpack: function _unpack(buffer, options, offsets) {
        var result = {};
        var patternValue = Schema.unpack(patternSchema, buffer, options, offsets);
        result[patternName] = patternValue;
        keys.every(function (key) {
          if (patternValue === schemas[key][0]) {
            result[key] = Schema.unpack(schemas[key][1], buffer, options, offsets);
            return false;
          }
          return true;
        });
        return result;
      },
      pack: function _pack(value, options, buffer) {
        var patternValue = value[patternName];
        Schema.pack(patternSchema, patternValue, options, buffer);
        keys.every(function (key) {
          if (patternValue === schemas[key][0]) {
            Schema.pack(schemas[key][1], value[key], options, buffer);
            return false;
          }
          return true;
        });
      },
      name: 'cases{' + patternName + '}',
      namespace: 'cases'
    });
  }
  Schema.register('cases', cases);
  /*</define>*/
};