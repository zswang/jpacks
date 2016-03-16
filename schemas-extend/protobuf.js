var protobufjs = require('protobufjs');

module.exports = function(Schema) {
  /*<define>*/
  function bytesify(value, options) {
    if (value instanceof Array) {
      return new Buffer(value);
    } else if (typeof value === 'string') {
      return new Buffer(Schema.stringBytes(value, options));
    } else {
      return new Buffer([]);
    }
  }
  /**
   * 将 JSON 数据填入 protobuf 结构中
   *
   * @param {Message of class} messager protobuf 数据类型
   * @param {Object} json JSON 数据
   */
  function protoify(messager, json, options) {
    if (!messager) {
      return json;
    }
    var result = {};
    Object.keys(json).forEach(function(key) {
      if (!messager.$type) {
        return;
      }
      var type = messager.$type.getChild(key);
      if (!type) {
        return;
      }
      if (typeof type.type === 'undefined') {
        return;
      }
      var value = json[key];

      if (type.repeated) { // 数组类型
        var items = [];
        value = value || [];
        for (var i = 0; i < value.length; i++) {
          if (!type.resolvedType) {
            if (type.type.name === 'bytes') {
              items.push(bytesify(value[i], options));
            } else {
              items.push(value[i]);
            }
          } else {
            items.push(protoify(type.resolvedType.clazz, value[i], options));
          }
        }
        result[key] = items;
        return;
      }

      if (type.type.name === 'bytes') {
        result[key] = bytesify(value, options);
        return;
      }

      if (!type.resolvedType) { // 基础类型
        result[key] = value;
        return;
      }

      result[key] = protoify(type.resolvedType.clazz, json[key], options);
    });
    return new messager(result);
  }
  function bytesprase(value, options) {
    if (options.protobuf_bytesAsString) {
      return Schema.unpack(Schema.string(value.length), value, options);
    } else {
      return Schema.unpack(Schema.bytes(value.length), value, options);
    }
  }
  /**
   * 清洗 protobuf 数据
   *
   * @param {Message of class} messager protobuf 数据类型
   * @param {Object} json JSON 数据
   */
  function jsonparse(messager, json, options) {
    if (!json || !messager) {
      return json;
    }
    var type = messager.$type;
    Object.keys(json).forEach(function(key) {
      if (!messager.$type) {
        delete json[key];
        return;
      }
      var type = messager.$type.getChild(key);
      if (!type) {
        delete json[key];
        return;
      }
      if (typeof type.type === 'undefined') {
        delete json[key];
        return;
      }
      var value = json[key];
      if (value === null) {
        delete json[key];
        return;
      }
      if (type.repeated) { // 数组类型
        value = value || [];
        for (var i = 0; i < value.length; i++) {
          if (!type.resolvedType) {
            if (type.type.name === 'bytes') {
              value[i] = bytesprase(value[i], options);
            }
          } else {
            jsonparse(type.resolvedType.clazz, value[i], options);
          }
        }
        return;
      }

      if (type.type.name === 'bytes') {
        json[key] = bytesprase(value, options);
        return;
      }

      if (!type.resolvedType) { // 基础类型
        return;
      }
      jsonparse(type.resolvedType.clazz, json[key], options);
    });
    return json;
  }

  /**
   * protobuf 数据结构
   *
   * @param {string} filename 文件名
   * @param {string} messagepath 消息体路径
   * @param {string|number|boolean} size 内容大小，为 true 则为自动大小
   '''<example>'''
   * @example protobufCreator():base
    ```js
    var _ = jpacks;
    var _schema = _.array(
      _.protobuf('test/protoify/json.proto', 'js.Value', 'uint16'),
      'int8'
    );
    console.log(_.stringify(_schema))
    // > array(protobuf('test/protoify/json.proto','js.Value','uint16'),'int8')

    var buffer = _.pack(_schema, [{
      integer: 123
    }, {
      object: {
        keys: [{
          string: 'name'
        }, {
          string: 'year'
        }],
        values: [{
          string: 'zswang'
        }, {
          integer: 2015
        }]
      }
    }]);

    console.log(buffer.join(' '));
    // > 2 3 0 8 246 1 33 0 58 31 10 6 26 4 110 97 109 101 10 6 26 4 121 101 97 114 18 8 26 6 122 115 119 97 110 103 18 3 8 190 31

    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > [{"integer":123},{"object":{"keys":[{"string":"name"},{"string":"year"}],"values":[{"string":"zswang"},{"integer":2015}]}}]
    ```
   * @example protobufCreator():bigint
    ```js
    var _ = jpacks;
    var _schema = _.array(
      _.protobuf('test/protoify/bigint.proto', 'bigint.Value', 'uint16'),
      'int8'
    );
    console.log(_.stringify(_schema))
    // > array(protobuf('test/protoify/bigint.proto','bigint.Value','uint16'),'int8')

    var buffer = _.pack(_schema, [{
      int64: "-192377746236123"
    }, {
      uint64: "192377746236123"
    }]);

    console.log(buffer.join(' '));
    // > 2 11 0 8 165 186 151 134 137 161 212 255 255 1 8 0 16 219 197 232 249 246 222 43

    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > [{"int64":"-192377746236123"},{"uint64":"192377746236123"}]
    ```
   * @example protobufCreator():bytesAsString
    ```js
    var _ = jpacks;
    var _schema = _.array(
      _.protobuf('test/protoify/string.proto', 'str.Value', 'uint16'),
      'int8'
    );
    console.log(_.stringify(_schema))
    // > array(protobuf('test/protoify/string.proto','str.Value','uint16'),'int8')

    _.setDefaultOptions({
      protobuf_bytesAsString: true
    });

    var buffer = _.pack(_schema, [{
      string: "Hello World!你好世界!"
    }, {
      bytes: "你好世界!Hello World!"
    }]);

    console.log(buffer.join(' '));
    // > 2 27 0 10 25 72 101 108 108 111 32 87 111 114 108 100 33 228 189 160 229 165 189 228 184 150 231 149 140 33 27 0 18 25 228 189 160 229 165 189 228 184 150 231 149 140 33 72 101 108 108 111 32 87 111 114 108 100 33

    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > [{"string":"Hello World!你好世界!"},{"bytes":"你好世界!Hello World!"}]
    ```
   * @example protobufCreator():proto text
    ```js
    var _ = jpacks;
    var _schema = _.array(
      _.protobuf('message Value { required string text = 1; }', 'Value', 'uint16'),
      'int8'
    );
    console.log(_.stringify(_schema))
    // > array(protobuf('message Value { required string text = 1; }','Value','uint16'),'int8')

    _.setDefaultOptions({
      protobuf_bytesAsString: true
    });

    var buffer = _.pack(_schema, [{
      text: "a"
    }, {
      text: "b"
    }]);

    console.log(buffer.join(' '));
    // > 2 3 0 10 1 97 3 0 10 1 98

    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > [{"text":"a"},{"text":"b"}]
    ```
   * @example protobufCreator():repeated bytes
    ```js
    var _ = jpacks;
    var _schema =
      _.protobuf('message BytesArray { repeated bytes items = 1; }', 'BytesArray', 'uint16');

    console.log(_.stringify(_schema))
    // > protobuf('message BytesArray { repeated bytes items = 1; }','BytesArray','uint16')

    _.setDefaultOptions({
      protobuf_bytesAsString: false
    });

    var buffer = _.pack(_schema, {
      items: [[1, 2, 3, 4], [5, 6, 7, 8], '12345678']
    });

    console.log(buffer.join(' '));
    // > 22 0 10 4 1 2 3 4 10 4 5 6 7 8 10 8 49 50 51 52 53 54 55 56

    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > {"items":[[1,2,3,4],[5,6,7,8],[49,50,51,52,53,54,55,56]]}
    ```
   '''</example>'''
   */
  function protobufCreator(prototext, messagepath, size) {
    var builder;
    if (/\s.*[{};]/.test(prototext)) {
      builder = protobufjs.loadProto(prototext);
    } else {
      builder = protobufjs.loadProtoFile(prototext);
    }
    var messager = builder.build(messagepath);
    return new Schema({
      unpack: function(buffer, options, offsets) {
        var bytes = Schema.unpack(Schema.bytes(size), buffer, options, offsets);
        var rs = messager.decode(bytes);
        var byteSize = rs.calculate();
        if (byteSize <= 0) {
          return null;
        }
        return jsonparse(messager, rs.toRaw(false, true), options);
      },
      pack: function _pack(value, options, buffer) {
        if (!value) {
          return;
        }
        var message = protoify(messager, value, options);
        var bytes = [];
        [].push.apply(bytes, new Uint8Array(message.toArrayBuffer()));
        Schema.pack(Schema.bytes(size), bytes, options, buffer);
      },
      namespace: 'protobuf',
      args: arguments
    });
  }
  var protobuf = Schema.together(protobufCreator, function(fn, args) {
    fn.namespace = 'protobuf';
    fn.args = args;
  });
  Schema.register('protobuf', protobuf);
  /*</define>*/
};