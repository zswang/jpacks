module.exports = function (Schema) {
  /*<define>*/
  /**
   * 声明字段依赖结构
   *
   * @param {string} field 字段名
   * @param {Function} schemaCreator 创建数据结构的方法
   * [[[
   *    @param {Any} value 传递值
   *    @return {Schema} 返回数据结构
   *    function schemaCreator(value) {}
   * ]]]
   '''<example>'''
   * @example dependCreator():base
    ```js
    var _ = jpacks;
    var _schema = _.object({
      length1: 'int8',
      length2: 'int8',
      data1: _.depend('length1', _.bytes),
      data2: _.depend('length2', _.array(_.shortString))
    });
    console.log(_.stringify(_schema));
    // > object({length1:'int8',length2:'int8',data1:depend('length1','bytes'),data2:depend('length2',array(string('uint8')))})

    var buffer = _.pack(_schema, {
      length1: 2,
      length2: 3,
      data1: [1, 2],
      data2: ['甲', '乙', '丙']
    });
    console.log(buffer.join(' '));
    // > 2 3 1 2 3 231 148 178 3 228 185 153 3 228 184 153

    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > {"length1":2,"length2":3,"data1":[1,2],"data2":["甲","乙","丙"]}
    ```
   '''</example>'''
   */
  function dependCreator(field, schemaCreator) {
    /*<safe>*/
    if (typeof field !== 'string') {
      throw new Error('Parameter "field" must be a string.');
    }
    if (typeof schemaCreator !== 'function') {
      throw new Error('Parameter "field" must be a function.');
    }
    /*</safe>*/

    return new Schema({
      unpack: function _unpack(buffer, options, offsets) {
        if (!options.$scope) {
          throw new Error('Unpack must running in object.');
        }
        var fieldValue = options.$scope[field];
        if (typeof fieldValue === 'undefined') {
          throw new Error('Field "' + field + '" is undefined.');
        }
        return Schema.unpack(schemaCreator(fieldValue), buffer, options, offsets);
      },
      pack: function _pack(value, options, buffer) {
        var fieldValue = options.$scope[field];
        if (typeof fieldValue === 'undefined') {
          throw new Error('Field "' + field + '" is undefined.');
        }
        Schema.pack(schemaCreator(fieldValue), value, options, buffer);
      },
      namespace: 'depend',
      args: arguments
    });
  }
  var depend = Schema.together(dependCreator, function (fn, args) {
    fn.namespace = 'depend';
    fn.args = args;
  });
  Schema.register('depend', depend);

  function dependArray(field, itemSchema) {
    return depend(field, Schema.array(itemSchema));
  }
  Schema.register('dependArray', dependArray);
  /*</define>*/
};