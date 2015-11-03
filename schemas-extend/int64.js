var jints = require('jints');

module.exports = function(Schema) {
  /*<define>*/
  /**
   * int64 类型
   *
   '''<example>'''
   * @example int64():string
    ```js
    var _ = jpacks;
    var _schema = _.int64;
    console.log(_.stringify(_schema))
    // > int64

    var buffer = _.pack(_schema, '1609531171697315243');

    console.log(buffer.join(' '));
    // > 171 205 239 175 18 52 86 22

    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > "1609531171697315243"
    ```
   * @example int64():number
    ```js
    var _ = jpacks;
    var _schema = _.int64;
    console.log(_.stringify(_schema))
    // > int64

    var buffer = _.pack(_schema, 171697315);

    console.log(buffer.join(' '));
    // > 163 228 59 10 0 0 0 0

    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > "171697315"
    ```
   * @example int64():littleEndian = false;
    ```js
    var _ = jpacks;
    var _schema = _.int64;
    console.log(_.stringify(_schema))
    // > int64

    var buffer = _.pack(_schema, 171697315, { littleEndian: false });

    console.log(buffer.join(' '));
    // > 0 0 0 0 10 59 228 163

    console.log(JSON.stringify(_.unpack(_schema, buffer, { littleEndian: false })));
    // > "171697315"
    ```
   '''</example>'''
   */
  var int64 = new Schema({
    unpack: function(buffer, options, offsets) {
      var bytes = Schema.unpack(Schema.bytes(8), buffer, options, offsets);
      var hex = bytes.map(function(item) {
         return (0x100 + item).toString(16).slice(1);
      });
      if (options.littleEndian) {
        hex.reverse();
      }
      hex = hex.join('');
      return jints.digit(hex, 16, 10);
    },
    pack: function _pack(value, options, buffer) {
      if (typeof value === 'number') {
        value = String(parseInt(value));
      }
      var hex;
      if (/^0x/.test(value)) {
        hex = value.slice(2);
      } else {
        hex = jints.fullZero(jints.digit(value, 10, 16), 16).slice(0, 16);
      }
      var bytes = [];
      hex.replace(/../g, function (all) {
        if (options.littleEndian) {
          bytes.unshift(parseInt(all, 16));
        } else {
          bytes.push(parseInt(all, 16));
        }
      });
      Schema.pack(Schema.bytes(8), bytes, options, buffer);
    },
    size: 8,
    name: 'int64',
    namespace: 'int64'
  });
  Schema.register('int64', int64);
  /*</define>*/
};