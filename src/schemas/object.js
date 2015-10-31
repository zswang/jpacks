module.exports = function defineObject(Schema) {
  /*<define>*/
  /**
   * 定义一个对象结构
   *
   * @param {object} schema 数据结构
   * @return {Schema} 返回构建的数据结构
   */
  function object(schema) {
    if (typeof schema !== 'object') {
      throw new Error('Parameter "schemas" must be a object type.');
    }
    if (schema instanceof Schema) {
      return schema;
    }
    return new Schema({
      unpack: function _unpack(buffer, options, offsets) {
        var result = {};
        var $scope = options.$scope;
        options.$scope = result;
        Object.keys(schema).forEach(function (key) {
          result[key] = Schema.unpack(schema[key], buffer, options, offsets);
        });
        options.$scope = $scope;
        return result;
      },
      pack: function _pack(value, options, buffer) {
        var $scope = options.$scope;
        options.$scope = value;
        Object.keys(schema).forEach(function (key) {
          Schema.pack(schema[key], value[key], options, buffer);
        });
        options.$scope = $scope;
      },
      object: schema,
      name: 'object {}'
    });
  };

  Schema.register('object', object);
  Schema.pushPattern(function _objectPattern(schema) {
    if (typeof schema === 'object') {
      if (schema instanceof Schema) {
        return;
      }
      if (schema instanceof Array) {
        return;
      }
      return object(schema);
    }
  });
  /*</define>*/
};
