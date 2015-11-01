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
   */
  function depend(field, schemaCreator) {
    if (typeof field !== 'string') {
      throw new Error('Parameter "field" must be a string.');
    }
    if (typeof schemaCreator !== 'function') {
      throw new Error('Parameter "field" must be a function.');
    }

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
      schema: 'depend(' + [field, Schema.stringify(schemaCreator)] + ')',
      namespace: 'depend'
    });
  }
  Schema.register('depend', depend);
  
  function dependArray(field, itemSchema) {
    return depend(field, Schema.array(itemSchema));
  }
  Schema.register('dependArray', dependArray);
  /*</define>*/
};