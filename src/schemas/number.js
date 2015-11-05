module.exports = function defineNumber(Schema) {
  /*<define>*/
  /**
   * 基础类型
   *
   * @type {Object}
   *   @key 基础类型名称
   *   @value
   *       @field {string} type 对应 DataView 类型名
   *       @field {number} size 数据大小，单位 byte
   *       @field {Array of string} alias 别名
   * @example all number
   '''<example>'''
    ```js
    var _ = jpacks;
    var _map = {
      bytes: _.bytes(8)
    };
    'int8,int16,int32,uint8,uint16,uint32,float32,float64,shortint,smallint,longint,byte,word,longword'.split(/,/).forEach(function (item) {
      _map[item] = item;
    });
    var _schema = _.union(_map, 8);
    console.log(_.stringify(_schema));
    // > union({bytes:array('uint8',8),int8:'int8',int16:'int16',int32:'int32',uint8:'uint8',uint16:'uint16',uint32:'uint32',float32:'float32',float64:'float64',shortint:'shortint',smallint:'smallint',longint:'longint',byte:'byte',word:'word',longword:'longword'},8)

    var buffer = _.pack(_schema, {
      bytes: [0x12, 0x23, 0x34, 0x45, 0x56, 0x67, 0x78, 0x89]
    });
    console.log(buffer.join(' '));
    // > 18 35 52 69 86 103 120 137

    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > {"bytes":[18,35,52,69,86,103,120,137],"int8":18,"int16":8978,"int32":1161044754,"uint8":18,"uint16":8978,"uint32":1161044754,"float32":2882.19189453125,"float64":-4.843717058781651e-263,"shortint":18,"smallint":8978,"longint":1161044754,"byte":18,"word":8978,"longword":1161044754}
    ```
   '''</example>'''
   * @example map is object
   */
  var bases = {
    int8: {
      type: 'Int8',
      size: 1,
      alias: ['shortint'],
      array: Int8Array
    },
    uint8: {
      type: 'Uint8',
      size: 1,
      alias: ['byte'],
      array: Uint8Array
    },
    int16: {
      type: 'Int16',
      size: 2,
      alias: ['smallint'],
      array: Int16Array
    },
    uint16: {
      type: 'Uint16',
      size: 2,
      alias: ['word'],
      array: Uint16Array
    },
    int32: {
      type: 'Int32',
      size: 4,
      alias: ['longint'],
      array: Int32Array
    },
    uint32: {
      type: 'Uint32',
      size: 4,
      alias: ['longword'],
      array: Uint32Array
    },
    float32: {
      type: 'Float32',
      size: 4,
      alias: ['single'],
      array: Float32Array
    },
    float64: {
      type: 'Float64',
      size: 8,
      alias: ['double'],
      array: Float64Array
    },
  };

  /**
   * 定义基础类型
   */
  Object.keys(bases).forEach(function (name) {
    var item = bases[name];
    var schema = new Schema({
      unpack: (function (method) {
        return function _unpack(buffer, options, offsets) {
          var offset = offsets[0];
          offsets[0] += item.size;
          var dataView;
          if (buffer instanceof DataView) {
            dataView = buffer;
          } else {
            dataView = new DataView(buffer);
          }
          return dataView[method](offset, options.littleEndian);
        };
      })('get' + item.type),
      pack: (function (method) {
        return function _pack(value, options, buffer) {
          var arrayBuffer = new ArrayBuffer(item.size);
          var dataView = new DataView(arrayBuffer);
          var uint8Array = new Uint8Array(arrayBuffer);
          dataView[method](0, value, options.littleEndian);
          [].push.apply(buffer, uint8Array);
        };
      })('set' + item.type),
      size: item.size,
      name: name,
      namespace: 'number',
      array: item.array
    });

    Schema.register(name, schema);
    (item.alias || []).forEach(function (alias) {
      Schema.register(alias, schema);
    });
  });
  /*</define>*/
};