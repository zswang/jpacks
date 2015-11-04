module.exports = function (Schema) {
  /*<define>*/
  /**
   * 定义一个对象结构
   *
   * @param {object} schema 数据结构
   * @return {Schema} 返回构建的数据结构
   '''<example>'''
   * @example objectCreator:array
    ```js
    var _ = jpacks;
    var _schema = _.object([_.shortString, _.word]);
    console.log(_.stringify(_schema));
    // > object([string(uint8),uint16])

    var buffer = _.pack(_schema, ['zswang', 1978]);
    console.log(buffer.join(' '));
    // > 6 122 115 119 97 110 103 186 7

    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > ["zswang",1978]
    ```
   * @example objectCreator:object
    ```js
    var _ = jpacks;
    var _schema = _.object({
      name: _.shortString,
      year: _.word
    });
    console.log(_.stringify(_schema));
    // > object({namespace:string,args:{0:uint8}})

    var buffer = _.pack(_schema, {
        name: 'zswang',
        year: 1978
      });
    console.log(buffer.join(' '));
    // > 6 122 115 119 97 110 103 186 7

    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > {"name":"zswang","year":1978}
    ```
   '''</example>'''
   */
  function objectCreator(objectSchema) {
    /*<safe>*/
    if (typeof objectSchema !== 'object') {
      throw new Error('Parameter "schemas" must be a object type.');
    }
    /*</safe>*/
    if (objectSchema instanceof Schema) {
      return objectSchema;
    }
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
      args: arguments,
      namespace: 'object'
    });
  }
  var object = Schema.together(objectCreator, function (fn, args) {
    fn.namespace = 'object';
    fn.args = args;
  });
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
