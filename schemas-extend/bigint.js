var long = require('long');

module.exports = function(Schema) {
  /*<define>*/
  /**
   * int64 类型
   *
   * @param {boolean} unsigned 是否有符号
   '''<example>'''
   * @example uint64():string
    ```js
    var _ = jpacks;
    var _schema = _.uint64;
    console.log(_.stringify(_schema))
    // > 'uint64'

    var buffer = _.pack(_schema, '1609531171697315243');

    console.log(buffer.join(' '));
    // > 171 205 239 175 18 52 86 22

    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > "1609531171697315243"
    ```
   * @example uint64():number
    ```js
    var _ = jpacks;
    var _schema = _.uint64;
    console.log(_.stringify(_schema))
    // > 'uint64'

    var buffer = _.pack(_schema, 171697315);

    console.log(buffer.join(' '));
    // > 163 228 59 10 0 0 0 0

    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > "171697315"
    ```
   * @example uint64():littleEndian = false;
    ```js
    var _ = jpacks;
    var _schema = _.uint64;
    console.log(_.stringify(_schema))
    // > 'uint64'

    var buffer = _.pack(_schema, 171697315, { littleEndian: false });

    console.log(buffer.join(' '));
    // > 0 0 0 0 10 59 228 163

    console.log(JSON.stringify(_.unpack(_schema, buffer, { littleEndian: false })));
    // > "171697315"
    ```
   * @example int64():-1,-2
    ```js
    var _ = jpacks;
    var _schema = _.int64;
    console.log(_.stringify(_schema))
    // > 'int64'

    var buffer = _.pack(_schema, '-1');

    console.log(buffer.join(' '));
    // > 255 255 255 255 255 255 255 255

    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > "-1"

    var buffer = _.pack(_schema, '-2');

    console.log(buffer.join(' '));
    // > 254 255 255 255 255 255 255 255

    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > "-2"
    ```
   * @example int64():-2, littleEndian = false
    ```js
    var _ = jpacks;
    var _schema = _.int64;
    console.log(_.stringify(_schema))
    // > 'int64'

    var buffer = _.pack(_schema, -2, { littleEndian: false });

    console.log(buffer.join(' '));
    // > 255 255 255 255 255 255 255 254

    console.log(JSON.stringify(_.unpack(_schema, buffer, { littleEndian: false })));
    // > "-2"
    ```
   '''</example>'''
   */
  function bigintCreator(unsigned) {
    return new Schema({
      unpack: function(buffer, options, offsets) {
        var bigint = Schema.unpack({
          high: 'uint32',
          low: 'uint32'
        }, buffer, options, offsets);
        bigint.unsigned = unsigned;
        if (options.littleEndian) {
          var temp = bigint.low;
          bigint.low = bigint.high;
          bigint.high = temp;
        }
        return long.fromValue(bigint).toString();
      },
      pack: function _pack(value, options, buffer) {
        var bigint = long.fromString(String(value), unsigned);
        var bytes = [];
        if (options.littleEndian) {
          var temp = bigint.low;
          bigint.low = bigint.high;
          bigint.high = temp;
        }
        Schema.pack({
          high: 'uint32',
          low: 'uint32'
        }, bigint, options, buffer);
      },
      size: 8,
      name: unsigned ? 'uint64' : 'int64',
      namespace: unsigned ? 'uint64' : 'int64'
    });
  }

  Schema.register('int64', bigintCreator(false));
  Schema.register('uint64', bigintCreator(true));
  /*</define>*/
};