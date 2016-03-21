module.exports = function (Schema) {
  /*<define>*/
  /**
   * 定义一个合并结构
   *
   * @param {Array of (Scheam|string)} schema 数据结构
   * @return {Schema} 返回构建的数据结构
   '''<example>'''
   * @example mergeCreator:base
    ```js
    var _ = jpacks;

    _.def('structA', {
      a: _.int8,
      b: _.int8
    });
    _.def('structB', {
      c: _.int8,
      d: _.int8
    });

    var _schema = _.merge(
      ['structA', 'structB']
    );
    console.log(_.stringify(_schema))
    // > object({a:'int8',b:'int8',c:'int8',d:'int8'})

    var buffer = _.pack(_schema, {
      a: 1,
      b: 2,
      c: 3,
      d: 4
    });

    console.log(buffer.join(' '));
    // > 1 2 3 4

    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > {"a":1,"b":2,"c":3,"d":4}
    ```
   '''</example>'''
   */
  function mergeCreator(schemas) {
    var mergeScheam = {};
    schemas.forEach(function (item) {
      var schema = Schema.from(item);
      if (!schema) {
        return;
      }
      var obj = schema.args[0];
      Object.keys(obj).forEach(function (key) {
        mergeScheam[key] = obj[key];
      });
    });
    return Schema.object(mergeScheam);
  }
  var merge = Schema.together(mergeCreator, function (fn, args) {
    fn.namespace = 'merge';
    fn.args = args;
  });
  Schema.register('merge', merge);
  /*</define>*/
};
