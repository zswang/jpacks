module.exports = function (Schema) {
  /*<define>*/
  /**
   * 声明指定长度或者下标的数组
   *
   * @param {string|Schema} itemSchema 元素类型
   * @param {string|Schema|number=} count 下标类型或个数
   * @return {Schema|Function} 返回数据结构
   '''<example>'''
   * @example arrayCreator():static array
    ```js
    var _ = jpacks;
    var _schema = jpacks.array('int16', 2);
    console.log(String(_schema));
    // > array(int16,2)

    var value = [12337, 12851];
    var buffer = jpacks.pack(_schema, value);
    console.log(buffer.join(' '));
    // > 49 48 51 50

    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > [12337,12851]
    ```
   * @example arrayCreator():dynamic array
    ```js
    var _ = jpacks;
    var _schema = jpacks.array('int16', 'int8');
    console.log(String(_schema));
    // > array(int16,int8)

    var value = [12337, 12851];
    var buffer = jpacks.pack(_schema, value);
    console.log(buffer.join(' '));
    // > 2 49 48 51 50

    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > [12337,12851]
    ```
   * @example arrayCreator():dynamic array 2
    ```js
    var _ = jpacks;
    var _schema = jpacks.array('int16')(6);
    console.log(String(_schema));
    // > array(int16,6)

    var value = [12337, 12851];
    var buffer = jpacks.pack(_schema, value);
    console.log(buffer.join(' '));
    // > 49 48 51 50 0 0 0 0 0 0 0 0

    console.log(JSON.stringify(jpacks.unpack(_schema, buffer)));
    // > [12337,12851,0,0,0,0]
    ```
   '''</example>'''
   */
  function arrayCreator(itemSchema, count) {
    /*<safe>*/
    if (typeof itemSchema === 'undefined') {
      throw new Error('Parameter "itemSchema" is undefined.');
    }
    /*</safe>*/
    /*<debug>
    console.log('arrayCreator()', Schema.stringify(itemSchema, count));
    //</debug>*/

    var size;
    var countSchema;
    if (typeof count === 'number') {
      size = itemSchema.size * count;
    } else {
      countSchema = Schema.from(count);
      /*<safe>*/
      if (countSchema.namespace !== 'number') {
        throw new Error('Parameter "count" is not a numeric type.');
      }
      /*</safe>*/
    }

    return new Schema({
      unpack: function _unpack(buffer, options, offsets) {
        var length = count;
        if (countSchema) {
          length = Schema.unpack(countSchema, buffer, options, offsets);
        }
        if (itemSchema.array && options.littleEndian) {
          size = countSchema.size * length;
          /* TypeArray littleEndian is true */
          var offset = offsets[0];
          offsets[0] += size;
          return [].slice.apply(new itemSchema.array(buffer, offset, length));
        }
        var result = [];
        for (var i = 0; i < length; i++) {
          result.push(Schema.unpack(itemSchema, buffer, options, offsets));
        }
        return result;
      },
      pack: function _pack(value, options, buffer) {
        var length = count;
        if (countSchema) {
          length = value ? value.length : 0;
          Schema.pack(countSchema, length, options, buffer);
        }
        if (itemSchema.array && options.littleEndian) {
          size = itemSchema.size * length;
          /* TypeArray littleEndian is true */
          var arrayBuffer = new ArrayBuffer(size);
          var typeArray = new itemSchema.array(arrayBuffer);
          typeArray.set(value);
          var uint8Array = new Uint8Array(arrayBuffer);
          [].push.apply(buffer, uint8Array);
        }

        for (var i = 0; i < length; i++) {
          Schema.pack(itemSchema, value[i], options, buffer);
        }
      },
      namespace: 'array',
      args: arguments,
      size: size
    });
  }

  var array = Schema.together(arrayCreator, function (fn, args) {
    fn.namespace = 'array';
    fn.args = args;
  });
  Schema.register('array', array);
  function shortArray(itemSchema) {
    return array(itemSchema, 'uint8');
  }
  Schema.register('shortArray', shortArray);
  function smallArray(itemSchema) {
    return array(itemSchema, 'uint16');
  }
  Schema.register('smallArray', smallArray);
  function longArray(itemSchema) {
    return array(itemSchema, 'uint32');
  }
  Schema.register('longArray', longArray);
  /*</define>*/
};