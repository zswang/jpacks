var zlib = require('zlib');

module.exports = function(Schema) {
  /*<define>*/
  /**
   * 创建 gzip 数据结构
   *
   * @param {Schema|string} dataSchema 原始数据结构
   * @param {Schema|string|number} sizeSchema 数据大小
   '''<example>'''
   * @example gzipCreator():base
    ```js
    var _ = jpacks;
    var _schema = _.object({
      type: 'uint8',
      data: _.gzip(_.shortString, 'uint16')
    });
    console.log(_.stringify(_schema))

    var buffer = _.pack(_schema, {
      type: 2,
      data: '你好世界！Hello'
    });

    console.log(buffer.join(' '));
    console.log(_.unpack(_schema, buffer));
    ```
   '''</example>'''
   */
  function gzipCreator(dataSchema, sizeSchema) {
    function _encode(buffer) {
      return zlib.gzipSync(new Buffer(buffer));
    }
    _encode.namespace = 'zlib.gzipSync';

    function _decode(buffer) {
      return zlib.gunzipSync(new Buffer(buffer));
    }
    _decode.namespace = 'zlib.gunzipSync';
    return Schema.parse(_encode, _decode, dataSchema, sizeSchema);
  }
  var gzip = Schema.together(gzipCreator, function(fn, args) {
    fn.namespace = 'gzip';
    fn.args = args;
  });
  Schema.register('gzip', gzip);

  /**
   * 创建 inflate 数据结构
   *
   * @param {Schema|string} dataSchema 原始数据结构
   * @param {Schema|string|number} sizeSchema 数据大小
   '''<example>'''
   * @example inflateCreator():base
    ```js
    var _ = jpacks;
    var _schema = _.object({
      type: 'uint8',
      data: _.inflate(_.shortString, 'uint16')
    });
    console.log(_.stringify(_schema))

    var buffer = _.pack(_schema, {
      type: 2,
      data: '你好世界！Hello'
    });

    console.log(buffer.join(' '));
    console.log(_.unpack(_schema, buffer));
    ```
   '''</example>'''
   */
  function inflateCreator(dataSchema, sizeSchema) {
    function _encode(buffer) {
      return zlib.deflateSync(new Buffer(buffer));
    }
    _encode.namespace = 'zlib.deflateSync';

    function _decode(buffer) {
      return zlib.inflateSync(new Buffer(buffer));
    }
    _decode.namespace = 'zlib.inflateSync';
    return Schema.parse(_encode, _decode, dataSchema, sizeSchema);
  }
  var inflate = Schema.together(inflateCreator, function(fn, args) {
    fn.namespace = 'inflate';
    fn.args = args;
  });
  Schema.register('inflate', inflate);
  /*</define>*/
};