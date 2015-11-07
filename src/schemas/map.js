module.exports = function (Schema) {
  /*<define>*/
  /**
   * 声明映射文件
   *
   * @param {string} field 字段名，即：元素的个数
   * @param {string|Schema} item 元素类型
   * @return {Schema|Function} 返回数据结构
   '''<example>'''
   * @example mapCreator():base
    ```js
    var _ = jpacks;
    var _schema = {
      size1: 'uint16',
      size2: 'uint16',
      data1: _.map('size1', 'uint8'),
      data2: _.map('size2', 'uint8')
    };
    console.log(_.stringify(_schema));
    // > {size1:'uint16',size2:'uint16',data1:map('size1','uint8'),data2:map('size2','uint8')}

    var buffer = jpacks.pack(_schema, {
      data1: [1, 2, 3, 4],
      data2: [1, 2, 3, 4, 5, 6, 7, 8],
    });
    console.log(buffer.join(' '));
    // > 4 0 8 0 1 2 3 4 1 2 3 4 5 6 7 8
    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > {"size1":4,"size2":8,"data1":[1,2,3,4],"data2":[1,2,3,4,5,6,7,8]}
    ```
   '''</example>'''
   */
  function mapCreator(field, item) {
    /*<safe>*/
    if (typeof field !== 'string') {
      throw new Error('Parameter "field" must be a string.');
    }
    /*</safe>*/
    /*<safe>*/
    if (typeof item === 'undefined') {
      throw new Error('Parameter "item" is undefined.');
    }
    /*</safe>*/

    return new Schema({
      unpack: function _unpack(buffer, options, offsets) {
        /*<safe>*/
        if (!options.$scope) {
          throw new Error('Unpack must running in object.');
        }
        /*</safe>*/
        var fieldValue = options.$scope.target[field];
        var itemSchema = Schema.from(item);
        /*<safe>*/
        if (typeof fieldValue === 'undefined') {
          throw new Error('Field "' + field + '" is undefined.');
        }
        /*</safe>*/
        return Schema.unpack(Schema.array(itemSchema, fieldValue), buffer, options, offsets);
      },
      pack: function _pack(value, options, buffer) {
        var fieldSchema = options.$scope.schema[field];
        /*<safe>*/
        if (typeof fieldSchema === 'undefined') {
          throw new Error('Field schema "' + field + '" is undefined.');
        }
        /*</safe>*/
        var itemSchema = Schema.from(item);
        var bytes = Schema.pack(fieldSchema, value.length, options);
        var offset = options.$scope.offsets[field];
        for (var i = 0; i < bytes.length; i++) {
          buffer[offset + i] = bytes[i];
        }
        Schema.pack(Schema.array(itemSchema, null), value, options, buffer);
      },
      namespace: 'map',
      args: arguments
    });
  }
  var map = Schema.together(mapCreator, function (fn, args) {
    fn.namespace = 'map';
    fn.args = args;
  });
  Schema.register('map', map);

  function mapArray(field, itemSchema) {
    return map(field, Schema.array(itemSchema));
  }
  Schema.register('mapArray', mapArray);
  /*</define>*/
};