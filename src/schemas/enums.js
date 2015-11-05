module.exports = function (Schema) {
  /*<define>*/
  /**
   * 定义一个枚举结构
   *
   * @param {Schema} baseSchema 枚举结构的基础类型
   * @param {Array|Object} map 枚举类型字典
   * @return {Schema} 返回构建的数据结构
   '''<example>'''
   * @example enumsCreator():map is array
    ```js
    var _ = jpacks;
    var _schema = _.enums(['Sun', 'Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat'], 'uint8');
    console.log(_.stringify(_schema));
    // > enums({Sun:0,Mon:1,Tues:2,Wed:3,Thur:4,Fri:5,Sat:6},'uint8')

    var buffer = _.pack(_schema, 'Tues');
    console.log(buffer.join(' '));
    // > 2

    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > "Tues"
    ```
   * @example enumsCreator():map is object
    ```js
    var _ = jpacks;
    var _schema = _.enums({
      Unknown: -1,
      Continue: 100,
      Processing: 100,
      OK: 200,
      Created: 201,
      NotFound: 404
    }, 'int8');
    console.log(_.stringify(_schema));
    // > enums({Unknown:-1,Continue:100,Processing:100,OK:200,Created:201,NotFound:404},'int8')

    var buffer = _.pack(_schema, 'Unknown');
    console.log(buffer.join(' '));
    // > 255

    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > "Unknown"
    ```
   * @example enumsCreator():fault tolerant
    ```js
    var _ = jpacks;
    var _schema = _.enums({
      Unknown: -1,
      Continue: 100,
      Processing: 100,
      OK: 200,
      Created: 201,
      NotFound: 404
    }, 'int8');
    console.log(_.stringify(_schema));
    // > enums({Unknown:-1,Continue:100,Processing:100,OK:200,Created:201,NotFound:404},'int8')

    var buffer = _.pack(_schema, 2);
    console.log(buffer.join(' '));
    // > 2

    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > 2
    ```
   '''</example>'''
   */
  function enumsCreator(map, baseSchema) {
    baseSchema = Schema.from(baseSchema);
    /*<safe>*/
    if (!baseSchema) {
      throw new Error('Parameter "baseSchema" is undefined.');
    }
    if (baseSchema.namespace !== 'number') {
      throw new Error('Parameter "baseSchema" is not a numeric type.');
    }
    if (typeof map !== 'object') {
      throw new Error('Parameter "map" must be a object type.');
    }
    /*</safe>*/
    if (map instanceof Array) {
      var temp = {};
      map.forEach(function (item, index) {
        temp[item] = index;
      });
      map = temp;
    }

    var keys = Object.keys(map);
    return new Schema({
      unpack: function _unpack(buffer, options, offsets) {
        var baseValue = Schema.unpack(baseSchema, buffer, options, offsets);
        var result;
        keys.every(function (key) {
          if (map[key] === baseValue) {
            result = key;
            return false;
          }
          return true;
        });
        return result || baseValue;
      },
      pack: function _pack(value, options, buffer) {
        if (typeof value === 'number') {
          Schema.pack(baseSchema, value, options, buffer);
          return;
        }
        if (keys.every(function (key) {
          if (key === value) {
            Schema.pack(baseSchema, map[key], options, buffer);
            return false;
          }
          return true;
        })) {
          throw new Error('Not find enum "' + value + '".');
        }
      },
      namespace: 'enums',
      args: arguments
    });
  }

  var enums = Schema.together(enumsCreator, function (fn, args) {
    fn.namespace = 'enums';
    fn.args = args;
  });
  Schema.register('enums', enums);
  /*</define>*/
};