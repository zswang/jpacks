var leb128 = require('leb128');
var Stream = require('leb128/stream');

module.exports = function(Schema) {
  /*<define>*/
  /**
   * leb128 类型, 变长整数
   *
   * @see https://en.wikipedia.org/wiki/LEB128
   *
   * @param {boolean} unsigned 是否有符号
   '''<example>'''
   * @example uleb128():string
    ```js
    var _ = jpacks;
    var _schema = _.uleb128;
    console.log(_.stringify(_schema))
    // > 'uleb128'

    var buffer = _.pack(_schema, '1609531171697315243');

    console.log(buffer.join(' '));
    // > 171 155 191 255 170 130 141 171 22

    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > "1609531171697315243"
    ```
   * @example uleb128():number
    ```js
    var _ = jpacks;
    var _schema = _.uleb128;
    console.log(_.stringify(_schema))
    // > 'uleb128'

    var buffer = _.pack(_schema, 171697315);

    console.log(buffer.join(' '));
    // > 163 201 239 81

    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > "171697315"
    ```
   * @example sleb128():-1,-2
    ```js
    var _ = jpacks;
    var _schema = _.sleb128;
    console.log(_.stringify(_schema))
    // > 'sleb128'

    var buffer = _.pack(_schema, '-1');

    console.log(buffer.join(' '));
    // > 127

    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > "-1"

    var buffer = _.pack(_schema, '-2');

    console.log(buffer.join(' '));
    // > 126

    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > "-2"
    ```
   * @example sleb128():array
    ```js
    var _ = jpacks;
    var _schema = _.array(_.uleb128, null);

    console.log(_.stringify(_schema))
    // > array('uleb128',null)

    var buffer = _.pack(_schema, ['1', '2', '3', '4', '1609531171697315243', '9008000000011122', 0, 0]);

    console.log(buffer.join(' '));
    // > 1 2 3 4 171 155 191 255 170 130 141 171 22 242 214 140 129 167 151 128 16 0 0

    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > ["1","2","3","4","1609531171697315243","9008000000011122","0","0"]
    ```
   '''</example>'''
   */
  function leb128Creator(unsigned) {
    var processor = unsigned ? leb128.unsigned : leb128.signed;
    return new Schema({
      unpack: function(buffer, options, offsets) {
        var stream = new Stream(new Buffer(buffer).slice(offsets[0]));
        var result = processor.read(stream);
        offsets[0] += stream._bytesRead;
        return result;
      },
      pack: function _pack(value, options, buffer) {
        var buf = processor.encode(value);
        Schema.pack(Schema.bytes(buf.length), buf, options, buffer);
      },
      name: unsigned ? 'uleb128' : 'sleb128',
      namespace: unsigned ? 'uleb128' : 'sleb128'
    });
  }

  Schema.register('sleb128', leb128Creator(false));
  Schema.register('uleb128', leb128Creator(true));
  /*</define>*/
};