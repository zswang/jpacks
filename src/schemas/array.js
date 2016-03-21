module.exports = function(Schema) {
  /*<define>*/
  /**
   * 声明指定长度或者下标的数组
   *
   * @param {string|Schema} item 元素类型
   * @param {string|Schema|number=} count 下标类型或个数
   * @return {Schema|Function} 返回数据结构
   '''<example>'''
   * @example arrayCreator():static array
    ```js
    var _ = jpacks;
    var _schema = jpacks.array('int16', 2);
    console.log(String(_schema));
    // > array('int16',2)

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
    // > array('int16','int8')

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
    // > array('int16',6)

    var value = [12337, 12851];
    var buffer = jpacks.pack(_schema, value);
    console.log(buffer.join(' '));
    // > 49 48 51 50 0 0 0 0 0 0 0 0

    console.log(JSON.stringify(jpacks.unpack(_schema, buffer)));
    // > [12337,12851,0,0,0,0]
    ```
   * @example arrayCreator():auto size int8
    ```js
    var _ = jpacks;
    var _schema = _.array('int8', null);
    console.log(_.stringify(_schema))
    // > array('int8',null)

    var buffer = _.pack(_schema, [0, 1, 2, 3, 4, 5, 6, 7]);

    console.log(buffer.join(' '));
    // > 0 1 2 3 4 5 6 7

    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > [0,1,2,3,4,5,6,7]
    ```
   * @example arrayCreator():auto size int16 littleEndian = true
    ```js
    var _ = jpacks;
    var _schema = _.array('int16', null);
    var options = {
      littleEndian: true
    };
    console.log(_.stringify(_schema))
    // > array('int16',null)

    var buffer = _.pack(_schema, [0, 1, 2, 3, 4, 5, 6, 7], options);

    console.log(buffer.join(' '));
    // > 0 0 1 0 2 0 3 0 4 0 5 0 6 0 7 0

    console.log(JSON.stringify(_.unpack(_schema, buffer, options)));
    // > [0,1,2,3,4,5,6,7]
    ```
   * @example arrayCreator():auto size int16 littleEndian = false
    ```js
    var _ = jpacks;
    var _schema = _.array('int16', null);
    var options = {
      littleEndian: false
    };
    console.log(_.stringify(_schema))
    // > array('int16',null)

    var buffer = _.pack(_schema, [0, 1, 2, 3, 4, 5, 6, 7], options);

    console.log(buffer.join(' '));
    // > 0 0 0 1 0 2 0 3 0 4 0 5 0 6 0 7

    console.log(JSON.stringify(_.unpack(_schema, buffer, options)));
    // > [0,1,2,3,4,5,6,7]
    ```
   * @example arrayCreator():size fault tolerant
    ```js
    var _ = jpacks;
    var _schema = _.array('int8', 4);
    console.log(_.stringify(_schema))
    // > array('int8',4)

    var buffer = _.pack(_schema, [0, 1, 2, 3, 4, 5, 6, 7]);

    console.log(buffer.join(' '));
    // > 0 1 2 3

    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > [0,1,2,3]

    var buffer = _.pack(_schema, [0, 1, 2]);

    console.log(buffer.join(' '));
    // > 0 1 2 0

    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > [0,1,2,0]
    ```
   * @example arrayCreator():defaultOptions & littleEndian
    ```js
    var _ = jpacks;
    var _schema = _.array('int16', 7);
    _schema.defaultOptions = {
      littleEndian: false
    };
    var buffer = _.pack(_schema, [1, 2, 3, 4, 5, 6, 7]);
    console.log(buffer.join(' '));
    // > 0 1 0 2 0 3 0 4 0 5 0 6 0 7

    _schema.defaultOptions = {
      littleEndian: true
    };
    var buffer = _.pack(_schema, [1, 2, 3, 4, 5, 6, 7]);
    console.log(buffer.join(' '));
    // > 1 0 2 0 3 0 4 0 5 0 6 0 7 0
    ```
   '''</example>'''
   */
  function arrayCreator(item, count) {
    /*<safe>*/
    if (typeof item === 'undefined') {
      throw new Error('Parameter "item" is undefined.');
    }
    /*</safe>*/
    /*<debug>
    console.log('arrayCreator()', Schema.stringify(item, count));
    //</debug>*/

    var countSchema;
    if (count !== 'number' && count !== null) { // static size && auto size
      countSchema = Schema.from(count);
    }

    return new Schema({
      unpack: function _unpack(buffer, options, offsets) {
        var length;
        if (countSchema) {
          length = Schema.unpack(countSchema, buffer, options, offsets);
        } else {
          length = count;
        }
        if (length === 0) {
          return [];
        }

        var result = [];
        var itemSchema = Schema.from(item);
        if (itemSchema.array && (options.littleEndian || itemSchema.size === 1)) {
          var offset = offsets[0];
          var size = length === null ? buffer.byteLength - offset : itemSchema.size * length;
          /* TypeArray littleEndian is true */

          var arrayBuffer = new ArrayBuffer(size);
          var typeArray = new itemSchema.array(arrayBuffer);
          var uint8Array = new Uint8Array(arrayBuffer);
          uint8Array.set(
            new Uint8Array(buffer, offset, Math.min(size, buffer.byteLength - offset))
          );
          [].push.apply(result, typeArray);
          offsets[0] += size;
          return result;
        }
        if (length === null) { // auto size
          var laseOffset;
          while (offsets[0] < buffer.byteLength && laseOffset !== offsets[0]) {
            laseOffset = offsets[0];
            result.push(Schema.unpack(itemSchema, buffer, options, offsets));
          }
        } else {
          for (var i = 0; i < length; i++) {
            result.push(Schema.unpack(itemSchema, buffer, options, offsets));
          }
        }
        return result;
      },
      pack: function _pack(value, options, buffer) {
        var itemSchema = Schema.from(item);
        if (!value && !countSchema) { // 数据不变
          return;
        }
        var length;
        if (countSchema) {
          length = value ? value.length : 0;
          Schema.pack(countSchema, length, options, buffer);
        } else {
          length = count === null ? (value || []).length : count;
        }
        if (!value || !length) {
          return;
        }
        if (itemSchema.array && (options.littleEndian || itemSchema.size === 1)) {
          var size = itemSchema.size * length;
          /* TypeArray littleEndian is true */
          var arrayBuffer = new ArrayBuffer(size);
          var typeArray = new itemSchema.array(arrayBuffer);
          typeArray.set(value.slice(0, length));
          var uint8Array = new Uint8Array(arrayBuffer);
          [].push.apply(buffer, uint8Array);
          return;
        }
        for (var i = 0; i < length; i++) {
          Schema.pack(itemSchema, (value || [])[i], options, buffer);
        }
      },
      namespace: 'array',
      args: arguments,
      size: count === 'number' ? itemSchema.size * count : undefined
    });
  }

  var array = Schema.together(arrayCreator, function(fn, args) {
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