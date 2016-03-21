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
    ```
   '''</example>'''
   */
  function mergeCreator(schemas) {
    var mergeScheam = {};
    schemas.forEach(function (item) {
      var schema = Schema.from(item)
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
