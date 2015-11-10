module.exports = function (Schema) {
  /*<define>*/
  /**
   * 定义一个虚拟结构
   *
   * @param {number|string} operator
   * @param {object} value 数据结构
   '''<example>'''
   * @example virtualCreator:number
    ```js
    var _ = jpacks;
    var _schema = _.object({
      f1: 'uint16',
      v1: _.depend('f1', _.virtual(-4))
    });
    console.log(_.stringify(_schema))
    // > object({f1:'uint16',v1:depend('f1',virtual(-4))})

    var buffer = _.pack(_schema, {
      f1: 4
    });

    console.log(buffer.join(' '));
    // > 4 0

    console.log(JSON.stringify(_.unpack(_schema, buffer, { littleEndian: false })));
    // > {"f1":1024,"v1":1020}
    ```
   * @example virtualCreator:string
    ```js
    var _ = jpacks;
    var _schema = _.object({
      name: _.shortString,
      welcome: _.depend('name', _.virtual('Hello '))
    });
    console.log(_.stringify(_schema))
    // > object({name:string('uint8'),welcome:depend('name',virtual('Hello '))})

    var buffer = _.pack(_schema, {
      name: 'World!'
    });

    console.log(buffer.join(' '));
    // > 6 87 111 114 108 100 33

    console.log(JSON.stringify(_.unpack(_schema, buffer, { littleEndian: false })));
    // > {"name":"World!","welcome":"Hello World!"}
    ```
   * @example virtualCreator:depend
    ```js
    var _ = jpacks;
    var _schema = _.object({
      name: _.shortString,
      welcome: _.depend('name', function (name) {
        switch (name) {
          case 'zswang':
            return _.depend('name', _.virtual('Hello '));
          case 'wang':
            return _.depend('name', _.virtual('Hi '));
        }
      })
    });
    console.log(_.stringify(_schema))
    // > object({name:string('uint8'),welcome:depend('name',$fn)})

    var buffer = _.pack(_schema, {
      name: 'zswang'
    });

    console.log(buffer.join(' '));
    // > 6 122 115 119 97 110 103

    console.log(JSON.stringify(_.unpack(_schema, buffer, { littleEndian: false })));
    // > {"name":"zswang","welcome":"Hello zswang"}

    var buffer = _.pack(_schema, {
      name: 'wang'
    });

    console.log(buffer.join(' '));
    // > 4 119 97 110 103

    console.log(JSON.stringify(_.unpack(_schema, buffer, { littleEndian: false })));
    // > {"name":"wang","welcome":"Hi wang"}
   ```
   '''</example>'''
   */
  function virtualCreator(operator, value) {
    return new Schema({
      unpack: function _unpack() {
        if (/string|number/.test(typeof operator)) {
          return operator + value;
        }
        if (typeof operator === 'function') {
          return operator(value);
        }
        return value;
      },
      pack: function _pack() {},
      args: arguments,
      namespace: 'virtual'
    });
  }
  var virtual = Schema.together(virtualCreator, function (fn, args) {
    fn.namespace = 'virtual';
    fn.args = args;
  });
  Schema.register('virtual', virtual);
  /*</define>*/
};
