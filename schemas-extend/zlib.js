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
    // > object({type:'uint8',data:parse('zlib.gzipSync','zlib.gunzipSync',string('uint8'),'uint16')})

    var buffer = _.pack(_schema, {
      type: 2,
      data: '你好世界！Hello'
    });

    console.log(buffer.slice(14).join(' '));
    // windows: 2 42 0 31 139 8 0 0 0 0 0 0 11 19 121 178 119 193 211 165 123 159 236 152 246 124 106 207 251 61 141 30 169 57 57 249 0 183 181 133 147 21 0 0 0
    // linux:   2 42 0 31 139 8 0 0 0 0 0 0 3 19 121 178 119 193 211 165 123 159 236 152 246 124 106 207 251 61 141 30 169 57 57 249 0 183 181 133 147 21 0 0 0
    // > 121 178 119 193 211 165 123 159 236 152 246 124 106 207 251 61 141 30 169 57 57 249 0 183 181 133 147 21 0 0 0

    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > {"type":2,"data":"你好世界！Hello"}
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
    // > object({type:'uint8',data:parse('zlib.deflateSync','zlib.inflateSync',string('uint8'),'uint16')})

    var buffer = _.pack(_schema, {
      type: 2,
      data: '你好世界！Hello'
    });

    console.log(buffer.join(' '));
    // > 2 30 0 120 156 19 121 178 119 193 211 165 123 159 236 152 246 124 106 207 251 61 141 30 169 57 57 249 0 152 20 12 247

    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > {"type":2,"data":"你好世界！Hello"}
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