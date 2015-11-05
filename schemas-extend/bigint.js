var jints = require('jints');

module.exports = function(Schema) {
  /*<define>*/
  function bytes2Hex(bytes) {
    return bytes.map(function (byte) {
      return (0x100 + byte).toString(16).slice(1);
    }).join('');
  }

  function hex2bytes(hex) {
    var bytes = [];
    hex.replace(/../g, function(all) {
      bytes.push(parseInt(all, 16));
    });
    return bytes;
  }

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
        var bytes = Schema.unpack(Schema.bytes(8), buffer, options, offsets);
        if (options.littleEndian) {
          bytes.reverse();
        }
        var signed = '';
        if (!unsigned && bytes[0] & (1 << 7)) {
          signed = '-';
          bytes = bytes.map(function (item) {
            return ~item & 0xff;
          });
          hex = bytes2Hex(bytes);
          hex = jints.add(hex, '1', 16);
          hex = jints.fullZero(hex, 16).replace(/^.+(.{16})$/, '$1'); // 避免位数过高
          bytes = hex2bytes(hex);
        }
        hex = bytes2Hex(bytes);
        return signed + jints.digit(hex, 16, 10);
      },
      pack: function _pack(value, options, buffer) {
        if (typeof value === 'number') {
          value = String(parseInt(value));
        } else {
          value = String(value);
        }
        var signed = value.indexOf('-') >= 0;
        var hex;
        if (/^0x/.test(value)) {
          hex = value.slice(2 + signed ? 1 : 0);
        } else {
          hex = jints.digit(value, 10, 16);
        }
        hex = jints.fullZero(hex, 16).replace(/^.+(.{16})$/, '$1'); // 避免位数过高
        var bytes = hex2bytes(hex);
        if (signed) {
          bytes = bytes.map(function (item) {
            return ~item & 0xff;
          });
          hex = bytes2Hex(bytes);
          hex = jints.add(hex, '1', 16);
          hex = jints.fullZero(hex, 16).replace(/^.+(.{16})$/, '$1'); // 避免位数过高
          bytes = hex2bytes(hex);
        }
        if (options.littleEndian) {
          bytes.reverse();
        }
        Schema.pack(Schema.bytes(8), bytes, options, buffer);
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