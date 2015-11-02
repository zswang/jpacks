module.exports = function (Schema) {
  /*<define>*/
  /**
   * 创建联合类型
   *
   * @param {number} size 联合类型总大小
   * @param {Object} schema 联合类型中出现的字段
   * @return {Schema} 返回联合类型
   '''<example>'''
   * @example unionCreator():base
    ```js
    var _ = jpacks;
    var _schema = _.union({
      length: _.byte,
      content: _.shortString
    }, 20);
    console.log(_.stringify(_schema));
    // -> union({length:uint8,content:string(uint8)},20)

    var buffer = _.pack(_schema, {
      content: '0123456789'
    });
    console.log(buffer.join(' '));
    // -> 10 48 49 50 51 52 53 54 55 56 57 0 0 0 0 0 0 0 0 0

    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // -> {"length":10,"content":"0123456789"}
    ```
   '''</example>'''
   */
  function unionCreator(schemas, size) {
    /*<safe>*/
    if (typeof schemas !== 'object') {
      throw new Error('Parameter "schemas" must be a object type.');
    }
    if (schemas instanceof Schema) {
      throw new Error('Parameter "schemas" cannot be a Schema object.');
    }
    /*</safe>*/
    var keys = Object.keys(schemas);
    return new Schema({
      unpack: function _unpack(buffer, options, offsets) {
        var beginOffset = offsets[0];
        var result = {};
        keys.forEach(function (key) {
          offsets[0] = beginOffset;
          result[key] = Schema.unpack(schemas[key], buffer, options, offsets);
        });
        offsets[0] += size;
        return result;
      },
      pack: function _pack(value, options, buffer) {
        var arrayBuffer = new ArrayBuffer(size);
        var uint8Array = new Uint8Array(arrayBuffer);
        keys.forEach(function (key) {
          if (typeof value[key] === 'undefined') {
            return;
          }
          var temp = [];
          Schema.pack(schemas[key], value[key], options, temp);
          uint8Array.set(temp);
        });
        [].push.apply(buffer, uint8Array);
      },
      size: size,
      args: arguments,
      namespace: 'union'
    });
  }
  var union = Schema.together(unionCreator, function (fn, args) {
    fn.namespace = 'union';
    fn.args = args;
  });
  Schema.register('union', union);
  /*</define>*/
};