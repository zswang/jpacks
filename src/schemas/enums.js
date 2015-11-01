module.exports = function (Schema) {
  /*<define>*/
  /**
   * 定义一个枚举结构
   *
   * @param {Schema} baseSchema 枚举结构的基础类型
   * @param {Array|Object} map 枚举类型字典
   * @return {Schema} 返回构建的数据结构
   */
  function enums(baseSchema, map) {
    baseSchema = Schema.from(baseSchema);
    if (!baseSchema) {
      throw new Error('Parameter "baseSchema" is undefined.');
    }
    if (baseSchema.namespace !== 'base') {
      throw new Error('Parameter "baseSchema" is not a numeric type.');
    }
    if (typeof map !== 'object') {
      throw new Error('Parameter "map" must be a object type.');
    }
    if (map instanceof Array) {
      var temp = {};
      map.forEach(function (item, index) {
        temp[item] = index;
      });
      map = temp;
    }

    var keys = Object.keys(map);
    return new Schema({
      unpack: function _unpack(buffer, options, offsets) {
        var baseValue = Schema.unpack(baseSchema, buffer, options, offsets);
        var result;
        keys.every(function (key) {
          if (map[key] === baseValue) {
            result = key;
            return false;
          }
          return true;
        });
        return result;
      },
      pack: function _pack(value, options, buffer) {
        if (keys.every(function (key) {
          if (key === value) {
            Schema.pack(baseSchema, map[key], options, buffer);
            return false;
          }
          return true;
        })) {
          throw new Error('Not find enum "' + value + '".');
        };
      },
      map: map,
      schema: 'enum(' + [Schema.stringify(baseSchema), Schema.stringify(map)] + ')',
      namespace: 'base'
    });
  };

  Schema.register('enums', enums);
  /*</define>*/
};