module.exports = function (Schema) {
  /*<define>*/
  /**
   * 定义一个对象结构
   *
   * @param {object} schema 数据结构
   * @return {Schema} 返回构建的数据结构
   */
  function object(objectSchema) {
    if (typeof objectSchema !== 'object') {
      throw new Error('Parameter "schemas" must be a object type.');
    }
    if (objectSchema instanceof Schema) {
      return objectSchema;
    }
    var names = Schema.stringify(objectSchema);
    var keys = Object.keys(objectSchema);
    return new Schema({
      unpack: function _unpack(buffer, options, offsets) {
        var result = new objectSchema.constructor();
        var $scope = options.$scope;
        options.$scope = result;
        keys.forEach(function (key) {
          result[key] = Schema.unpack(objectSchema[key], buffer, options, offsets);
        });
        options.$scope = $scope;
        return result;
      },
      pack: function _pack(value, options, buffer) {
        var $scope = options.$scope;
        options.$scope = value;
        keys.forEach(function (key) {
          Schema.pack(objectSchema[key], value[key], options, buffer);
        });
        options.$scope = $scope;
      },
      object: objectSchema,
      schema: 'object(' + names + ')',
      namespace: 'object'
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
