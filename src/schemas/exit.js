module.exports = function (Schema) {
  /*<define>*/
  /**
   * 退出对象类型的处理过程
   *
   '''<example>'''
   * @example exitCreator():base
    ```js
    var _ = jpacks;
    var _schema = _.object({
      a: _.int8,
      b: _.int8,
      c: _.exit(),
      d: _.int8,
      e: _.int8
    });
    console.log(_.stringify(_schema));
    // > object({a:'int8',b:'int8',c:exit(),d:'int8',e:'int8'})

    var buffer = _.pack(_schema, {
      a: 1,
      b: 2,
      c: 3,
      d: 4,
      e: 5
    });
    console.log(buffer.join(' '));
    // > 1 2

    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > {"a":1,"b":2,"c":null,"d":null,"e":null}
    ```
   * @example exitCreator():depend
    ```js
    var _ = jpacks;
    _.def('A', {
      a: _.int8,
      b: _.depend('a', function (a) {
        return a === 1 ? _.int8 : _.exit();
      }),
      c: _.int8,
    });
    var _schema = _.object({
      f1: 'A',
      f2: 'A'
    })
    console.log(_.stringify(_schema));
    // > object({f1:'A',f2:'A'})

    var buffer = _.pack(_schema, {
      f1: {
        a: 1,
        b: 1,
        c: 2
      },
      f2: {
        a: 0,
        b: 1,
        c: 2
      }
    });
    console.log(buffer.join(' '));
    // > 1 1 2 0

    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > {"f1":{"a":1,"b":1,"c":2},"f2":{"a":0,"b":null,"c":null}}
    ```
   '''</example>'''
   */
  function exitCreator() {
    return new Schema({
      unpack: function _unpack(buffer, options, offsets) {
        /*<safe>*/
        if (!options.$scope) {
          throw new Error('Unpack must running in object.');
        }
        /*</safe>*/
        options.$scope.exit = true;
        return null;
      },
      pack: function _pack(value, options, buffer) {
        /*<safe>*/
        if (!options.$scope) {
          throw new Error('Unpack must running in object.');
        }
        /*</safe>*/
        options.$scope.exit = true;
      },
      namespace: 'exit',
      args: arguments
    });
  }
  var exit = Schema.together(exitCreator, function (fn, args) {
    fn.namespace = 'exit';
    fn.args = args;
  });
  Schema.register('exit', exit);
  /*</define>*/
};

