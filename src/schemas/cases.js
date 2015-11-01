module.exports = function (Schema) {
  /*<define>*/
  /**
   * 创建条件类型
   *
   * @param {Array of array} patterns 数组第一元素表示命中条件，第二位类型
   * @return {Schema} 返回条件类型
   * @example 调用示例 1
    ```js
    var _ = jpacks;
    var _schema = {
      name: ['name', _.shortString],
      age: ['age', _.byte]
    };
    var ab = _.pack(_schema, {
      type: 'name',
      name: 'tom'
    });
    var u8a = new Uint8Array(ab);
    console.log(u8a);
    // -> [4, 110, 97, 109, 101, 3, 116, 111, 109]

    console.log(_.unpack(_schema, u8a));
    // -> Object {type: "name", name: "tom"}

    var ab2 = _.pack(_schema, {
      type: 'age',
      age: 23
    });
    var u8a2 = new Uint8Array(ab2);
    console.log(u8a2);
    // -> [3, 97, 103, 101, 23]

    console.log(_.unpack(_schema, u8a2));
    // -> Object {type: "age", age: 23}
    ```
  */
  function cases(patterns) {
    /*<safe>*/
    if (typeof patterns !== 'object') {
      throw new Error('Parameter "patterns" must be a object type.');
    }
    if (patterns instanceof Schema) {
      throw new Error('Parameter "patterns" cannot be a Schema object.');
    }
    if (!(patterns instanceof Array)) {
      throw new Error('Parameter "patterns" must be a array.');
    }
    /*</safe>*/
    
    var schemaCreator = function (value) {
      for (var i = 0; i < patterns.length; i++) {
        if (patterns[i][0] === value) {
          return patterns[i][1];
        }
      }
    };
    schemaCreator.schema = 'cases(' + Schema.stringify(patterns) + ')';
    schemaCreator.namespace = 'cases';
    return schemaCreator;
  }
  Schema.register('cases', cases);
  /*</define>*/
};