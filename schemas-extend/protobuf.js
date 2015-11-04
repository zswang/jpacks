var protobufjs = require('protobufjs');

module.exports = function(Schema) {
  /*<define>*/
  /**
   * 将 JSON 数据填入 protobuf 结构中
   *
   * @param {Message of class} messager protobuf 数据类型
   * @param {Object} json JSON 数据
   */
  function protoify(messager, json) {
    if (!messager) {
      throw new Error('messager is undefined.');
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

      if (!type.resolvedType) { // 基础类型
        result[key] = value;
        return;
      }

      if (type.repeated) { // 数组类型
        var items = [];
        value = value || [];
        for (var i = 0; i < value.length; i++) {
          items.push(protoify(type.resolvedType.clazz, value[i]));
        }
        result[key] = items;
      } else {
        result[key] = protoify(type.resolvedType.clazz, json[key]);
      }
    });
    return new messager(result);
  }

  /**
   * 清洗 protobuf 数据
   *
   * @param {Message of class} messager protobuf 数据类型
   * @param {Object} json JSON 数据
   */
  function jsonify(messager, json) {
    if (arguments.length === 1) {
      json = messager.toRaw(false, true);
      messager = messager.$type.clazz;
    }
    if (!json) {
      return;
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
      if (!type.resolvedType) { // 基础类型
        return;
      }
      if (type.repeated) { // 数组类型
        value = value || [];
        for (var i = 0; i < value.length; i++) {
          jsonify(type.resolvedType.clazz, value[i]);
        }
      } else {
        jsonify(type.resolvedType.clazz, json[key]);
      }
    });
    return json;
  }

  /**
   * protobuf 数据结构
   *
   * @param {string} filename 文件名
   * @param {string} packagename 包名
   * @param {string} messagename 信息名
   '''<example>'''
   * @example protobufCreator():base
    ```js
    var _ = jpacks;
    var _schema = _.array(
      _.protobuf('test/protoify/json.proto', 'js.Value', 'uint16'),
      'int8'
    );
    console.log(_.stringify(_schema))
    // > array(protobuf(test/protoify/json.proto,js.Value,uint16),int8)

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
    // > array(protobuf(test/protoify/bigint.proto,bigint.Value,uint16),int8)

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
   '''</example>'''
   */
  function protobufCreator(filename, messagepath, size) {
    var builder = protobufjs.loadProtoFile(filename);
    var messager = builder.build(messagepath);
    return new Schema({
      unpack: function(buffer, options, offsets) {
        var bytes = Schema.unpack(Schema.bytes(size), buffer, options, offsets);
        var rs = messager.decode(bytes);
        var calculate = rs.calculate();
        if (calculate <= 0) {
          return null;
        }
        return jsonify(rs);
      },
      pack: function _pack(value, options, buffer) {
        if (!value) {
          return;
        }
        var message = protoify(messager, value);
        var uint8Array = new Uint8Array(message.toArrayBuffer());
        Schema.pack(Schema.bytes(size), uint8Array, options, buffer);
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