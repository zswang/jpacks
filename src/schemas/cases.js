module.exports = function(Schema) {
  /*<define>*/
  /**
   * 创建条件类型
   *
   * @param {Array of array|Function} patterns 数组第一元素表示命中条件，第二位类型
   * @return {Schema} 返回条件类型
   '''<example>'''
   * @example casesCreator():base
    ```js
    var _ = jpacks;
    var _schema = {
      type: _.shortString,
      data: _.depend('type', _.cases([
        ['name', _.shortString],
        ['age', _.byte]
      ]))
    };
    console.log(_.stringify(_schema));
    // > {type:string('uint8'),data:depend('type',cases([['name',string('uint8')],['age','uint8']]))}

    var buffer = _.pack(_schema, {
      type: 'name',
      data: 'tom'
    });
    console.log(buffer.join(' '));
    // > 4 110 97 109 101 3 116 111 109
    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > {"type":"name","data":"tom"}

    var buffer = _.pack(_schema, {
      type: 'age',
      data: 23
    });
    console.log(buffer.join(' '));
    // > 3 97 103 101 23
    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > {"type":"age","data":23}
    ```
   * @example casesCreator():function
    ```js
    var _ = jpacks;
    var _schema = {
      type: _.shortString,
      data: _.depend('type', _.cases(function(type) {
        switch (type) {
          case 'age':
            return _.byte;
          case 'name':
            return _.shortString;
        }
        return _.bytes(null);
      }))
    };
    console.log(_.stringify(_schema));
    // > {type:string('uint8'),data:depend('type',cases($fn))}

    var buffer = _.pack(_schema, {
      type: 'name',
      data: 'tom'
    });
    console.log(buffer.join(' '));
    // > 4 110 97 109 101 3 116 111 109
    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > {"type":"name","data":"tom"}

    var buffer = _.pack(_schema, {
      type: 'age',
      data: 23
    });
    console.log(buffer.join(' '));
    // > 3 97 103 101 23
    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > {"type":"age","data":23}

    var buffer = _.pack(_schema, {
      type: 'other',
      data: [1, 2, 3, 4, 5]
    });
    console.log(buffer.join(' '));
    // > 5 111 116 104 101 114 1 2 3 4 5
    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > {"type":"other","data":[1,2,3,4,5]}
    ```
   '''</example>'''
  */
  function casesCreator(patterns, value) {
    if (typeof patterns === 'function') {
      return patterns(value);
    } else if (patterns instanceof Array) {
      for (var i = 0; i < patterns.length; i++) {
        if (patterns[i][0] === value) {
          return patterns[i][1];
        }
      }
    }
  }
  var cases = Schema.together(casesCreator, function(fn, args) {
    fn.namespace = 'cases';
    fn.args = args;
  });
  Schema.register('cases', cases);
  /*</define>*/
};