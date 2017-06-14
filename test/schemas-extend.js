var assert = require('should');
var jpacks = require('../.');
var util = require('util');

require('.././schemas-extend/bigint')(jpacks);
require('.././schemas-extend/protobuf')(jpacks);
require('.././schemas-extend/zlib')(jpacks);
require('.././schemas-extend/leb128')(jpacks);

jpacks.setDefaultOptions({
  browser: true
});

describe("schemas-extend/bigint.js", function () {
  var assert = require('should');
  var util = require('util');
  var examplejs_printLines;
  function examplejs_print() {
    examplejs_printLines.push(util.format.apply(util, arguments));
  }
  
  

  it("uint64():string", function () {
    examplejs_printLines = [];
    var _ = jpacks;
    var _schema = _.uint64;
    examplejs_print(_.stringify(_schema))
    assert.equal(examplejs_printLines.join("\n"), "'uint64'"); examplejs_printLines = [];

    var buffer = _.pack(_schema, '1609531171697315243');

    examplejs_print(buffer.join(' '));
    assert.equal(examplejs_printLines.join("\n"), "171 205 239 175 18 52 86 22"); examplejs_printLines = [];

    examplejs_print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(examplejs_printLines.join("\n"), "\"1609531171697315243\""); examplejs_printLines = [];
  });
          
  it("uint64():number", function () {
    examplejs_printLines = [];
    var _ = jpacks;
    var _schema = _.uint64;
    examplejs_print(_.stringify(_schema))
    assert.equal(examplejs_printLines.join("\n"), "'uint64'"); examplejs_printLines = [];

    var buffer = _.pack(_schema, 171697315);

    examplejs_print(buffer.join(' '));
    assert.equal(examplejs_printLines.join("\n"), "163 228 59 10 0 0 0 0"); examplejs_printLines = [];

    examplejs_print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(examplejs_printLines.join("\n"), "\"171697315\""); examplejs_printLines = [];
  });
          
  it("uint64():littleEndian = false;", function () {
    examplejs_printLines = [];
    var _ = jpacks;
    var _schema = _.uint64;
    examplejs_print(_.stringify(_schema))
    assert.equal(examplejs_printLines.join("\n"), "'uint64'"); examplejs_printLines = [];

    var buffer = _.pack(_schema, 171697315, { littleEndian: false });

    examplejs_print(buffer.join(' '));
    assert.equal(examplejs_printLines.join("\n"), "0 0 0 0 10 59 228 163"); examplejs_printLines = [];

    examplejs_print(JSON.stringify(_.unpack(_schema, buffer, { littleEndian: false })));
    assert.equal(examplejs_printLines.join("\n"), "\"171697315\""); examplejs_printLines = [];
  });
          
  it("int64():-1,-2", function () {
    examplejs_printLines = [];
    var _ = jpacks;
    var _schema = _.int64;
    examplejs_print(_.stringify(_schema))
    assert.equal(examplejs_printLines.join("\n"), "'int64'"); examplejs_printLines = [];

    var buffer = _.pack(_schema, '-1');

    examplejs_print(buffer.join(' '));
    assert.equal(examplejs_printLines.join("\n"), "255 255 255 255 255 255 255 255"); examplejs_printLines = [];

    examplejs_print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(examplejs_printLines.join("\n"), "\"-1\""); examplejs_printLines = [];

    var buffer = _.pack(_schema, '-2');

    examplejs_print(buffer.join(' '));
    assert.equal(examplejs_printLines.join("\n"), "254 255 255 255 255 255 255 255"); examplejs_printLines = [];

    examplejs_print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(examplejs_printLines.join("\n"), "\"-2\""); examplejs_printLines = [];
  });
          
  it("int64():-2, littleEndian = false", function () {
    examplejs_printLines = [];
    var _ = jpacks;
    var _schema = _.int64;
    examplejs_print(_.stringify(_schema))
    assert.equal(examplejs_printLines.join("\n"), "'int64'"); examplejs_printLines = [];

    var buffer = _.pack(_schema, -2, { littleEndian: false });

    examplejs_print(buffer.join(' '));
    assert.equal(examplejs_printLines.join("\n"), "255 255 255 255 255 255 255 254"); examplejs_printLines = [];

    examplejs_print(JSON.stringify(_.unpack(_schema, buffer, { littleEndian: false })));
    assert.equal(examplejs_printLines.join("\n"), "\"-2\""); examplejs_printLines = [];
  });
          
});
         

describe("schemas-extend/leb128.js", function () {
  var assert = require('should');
  var util = require('util');
  var examplejs_printLines;
  function examplejs_print() {
    examplejs_printLines.push(util.format.apply(util, arguments));
  }
  
  

  it("uleb128():string", function () {
    examplejs_printLines = [];
    var _ = jpacks;
    var _schema = _.uleb128;
    examplejs_print(_.stringify(_schema))
    assert.equal(examplejs_printLines.join("\n"), "'uleb128'"); examplejs_printLines = [];

    var buffer = _.pack(_schema, '1609531171697315243');

    examplejs_print(buffer.join(' '));
    assert.equal(examplejs_printLines.join("\n"), "171 155 191 255 170 130 141 171 22"); examplejs_printLines = [];

    examplejs_print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(examplejs_printLines.join("\n"), "\"1609531171697315243\""); examplejs_printLines = [];
  });
          
  it("uleb128():number", function () {
    examplejs_printLines = [];
    var _ = jpacks;
    var _schema = _.uleb128;
    examplejs_print(_.stringify(_schema))
    assert.equal(examplejs_printLines.join("\n"), "'uleb128'"); examplejs_printLines = [];

    var buffer = _.pack(_schema, 171697315);

    examplejs_print(buffer.join(' '));
    assert.equal(examplejs_printLines.join("\n"), "163 201 239 81"); examplejs_printLines = [];

    examplejs_print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(examplejs_printLines.join("\n"), "\"171697315\""); examplejs_printLines = [];
  });
          
  it("sleb128():-1,-2", function () {
    examplejs_printLines = [];
    var _ = jpacks;
    var _schema = _.sleb128;
    examplejs_print(_.stringify(_schema))
    assert.equal(examplejs_printLines.join("\n"), "'sleb128'"); examplejs_printLines = [];

    var buffer = _.pack(_schema, '-1');

    examplejs_print(buffer.join(' '));
    assert.equal(examplejs_printLines.join("\n"), "127"); examplejs_printLines = [];

    examplejs_print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(examplejs_printLines.join("\n"), "\"-1\""); examplejs_printLines = [];

    var buffer = _.pack(_schema, '-2');

    examplejs_print(buffer.join(' '));
    assert.equal(examplejs_printLines.join("\n"), "126"); examplejs_printLines = [];

    examplejs_print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(examplejs_printLines.join("\n"), "\"-2\""); examplejs_printLines = [];
  });
          
});
         

describe("schemas-extend/protobuf.js", function () {
  var assert = require('should');
  var util = require('util');
  var examplejs_printLines;
  function examplejs_print() {
    examplejs_printLines.push(util.format.apply(util, arguments));
  }
  
  

  it("protobufCreator():base", function () {
    examplejs_printLines = [];
    var _ = jpacks;
    var _schema = _.array(
      _.protobuf('test/protoify/json.proto', 'js.Value', 'uint16'),
      'int8'
    );
    examplejs_print(_.stringify(_schema))
    assert.equal(examplejs_printLines.join("\n"), "array(protobuf('test/protoify/json.proto','js.Value','uint16'),'int8')"); examplejs_printLines = [];

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

    examplejs_print(buffer.join(' '));
    assert.equal(examplejs_printLines.join("\n"), "2 3 0 8 246 1 33 0 58 31 10 6 26 4 110 97 109 101 10 6 26 4 121 101 97 114 18 8 26 6 122 115 119 97 110 103 18 3 8 190 31"); examplejs_printLines = [];

    examplejs_print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(examplejs_printLines.join("\n"), "[{\"integer\":123},{\"object\":{\"keys\":[{\"string\":\"name\"},{\"string\":\"year\"}],\"values\":[{\"string\":\"zswang\"},{\"integer\":2015}]}}]"); examplejs_printLines = [];
  });
          
  it("protobufCreator():bigint", function () {
    examplejs_printLines = [];
    var _ = jpacks;
    var _schema = _.array(
      _.protobuf('test/protoify/bigint.proto', 'bigint.Value', 'uint16'),
      'int8'
    );
    examplejs_print(_.stringify(_schema))
    assert.equal(examplejs_printLines.join("\n"), "array(protobuf('test/protoify/bigint.proto','bigint.Value','uint16'),'int8')"); examplejs_printLines = [];

    var buffer = _.pack(_schema, [{
      int64: "-192377746236123"
    }, {
      uint64: "192377746236123"
    }]);

    examplejs_print(buffer.join(' '));
    assert.equal(examplejs_printLines.join("\n"), "2 11 0 8 165 186 151 134 137 161 212 255 255 1 8 0 16 219 197 232 249 246 222 43"); examplejs_printLines = [];

    examplejs_print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(examplejs_printLines.join("\n"), "[{\"int64\":\"-192377746236123\"},{\"uint64\":\"192377746236123\"}]"); examplejs_printLines = [];
  });
          
  it("protobufCreator():bytesAsString", function () {
    examplejs_printLines = [];
    var _ = jpacks;
    var _schema = _.array(
      _.protobuf('test/protoify/string.proto', 'str.Value', 'uint16'),
      'int8'
    );
    examplejs_print(_.stringify(_schema))
    assert.equal(examplejs_printLines.join("\n"), "array(protobuf('test/protoify/string.proto','str.Value','uint16'),'int8')"); examplejs_printLines = [];

    _.setDefaultOptions({
      protobuf_bytesAsString: true
    });

    var buffer = _.pack(_schema, [{
      string: "Hello World!你好世界!"
    }, {
      bytes: "你好世界!Hello World!"
    }]);

    examplejs_print(buffer.join(' '));
    assert.equal(examplejs_printLines.join("\n"), "2 27 0 10 25 72 101 108 108 111 32 87 111 114 108 100 33 228 189 160 229 165 189 228 184 150 231 149 140 33 27 0 18 25 228 189 160 229 165 189 228 184 150 231 149 140 33 72 101 108 108 111 32 87 111 114 108 100 33"); examplejs_printLines = [];

    examplejs_print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(examplejs_printLines.join("\n"), "[{\"string\":\"Hello World!你好世界!\"},{\"bytes\":\"你好世界!Hello World!\"}]"); examplejs_printLines = [];
  });
          
  it("protobufCreator():proto text", function () {
    examplejs_printLines = [];
    var _ = jpacks;
    var _schema = _.array(
      _.protobuf('message Value { required string text = 1; }', 'Value', 'uint16'),
      'int8'
    );
    examplejs_print(_.stringify(_schema))
    assert.equal(examplejs_printLines.join("\n"), "array(protobuf('message Value { required string text = 1; }','Value','uint16'),'int8')"); examplejs_printLines = [];

    _.setDefaultOptions({
      protobuf_bytesAsString: true
    });

    var buffer = _.pack(_schema, [{
      text: "a"
    }, {
      text: "b"
    }]);

    examplejs_print(buffer.join(' '));
    assert.equal(examplejs_printLines.join("\n"), "2 3 0 10 1 97 3 0 10 1 98"); examplejs_printLines = [];

    examplejs_print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(examplejs_printLines.join("\n"), "[{\"text\":\"a\"},{\"text\":\"b\"}]"); examplejs_printLines = [];
  });
          
  it("protobufCreator():repeated bytes", function () {
    examplejs_printLines = [];
    var _ = jpacks;
    var _schema =
      _.protobuf('message BytesArray { repeated bytes items = 1; }', 'BytesArray', 'uint16');

    examplejs_print(_.stringify(_schema))
    assert.equal(examplejs_printLines.join("\n"), "protobuf('message BytesArray { repeated bytes items = 1; }','BytesArray','uint16')"); examplejs_printLines = [];

    _.setDefaultOptions({
      protobuf_bytesAsString: false
    });

    var buffer = _.pack(_schema, {
      items: [[1, 2, 3, 4], [5, 6, 7, 8], '12345678']
    });

    examplejs_print(buffer.join(' '));
    assert.equal(examplejs_printLines.join("\n"), "22 0 10 4 1 2 3 4 10 4 5 6 7 8 10 8 49 50 51 52 53 54 55 56"); examplejs_printLines = [];

    examplejs_print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(examplejs_printLines.join("\n"), "{\"items\":[[1,2,3,4],[5,6,7,8],[49,50,51,52,53,54,55,56]]}"); examplejs_printLines = [];
  });
          
  it("protobufCreator():int64 from empty string", function () {
    examplejs_printLines = [];
    var _ = jpacks;
    var _schema = _.protobuf('package Long; message Value { optional int64 int64_value = 1; optional int32 int32_value = 2; optional float float_value = 3; }', 'Long.Value', null);

    var buffer = _.pack(_schema, {
      int64_value: '',
      int32_value: '',
      float_value: ''
    });

    examplejs_print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(examplejs_printLines.join("\n"), "{\"int64_value\":\"0\",\"int32_value\":0,\"float_value\":0}"); examplejs_printLines = [];
  });
          
  it("protobufCreator():repeated & not array", function () {
    examplejs_printLines = [];

    (function() {
    var _ = jpacks;
    var _schema = _.protobuf('package MyPackage; message MyMessage { repeated int32 arr = 1; }', 'MyPackage.MyMessage', null);

    var buffer = _.pack(_schema, {
      arr: 1
    });
    // * throw
    }).should.throw();
  });
          
  it("protobufCreator():coverage", function () {
    examplejs_printLines = [];
    var _ = jpacks;
    var _schema = _.protobuf('package MyPackage; message MyMessage { repeated int32 arr = 1; }', 'MyPackage.MyMessage', null);

    _.pack(_schema, null);
    _.unpack(_schema, []);
    _.protobuf()('package MyPackage; message MyMessage { repeated int32 arr = 1; }', 'MyPackage.MyMessage', null);
  });
          
});
         

describe("schemas-extend/zlib.js", function () {
  var assert = require('should');
  var util = require('util');
  var examplejs_printLines;
  function examplejs_print() {
    examplejs_printLines.push(util.format.apply(util, arguments));
  }
  
  

  it("gzipCreator():base", function () {
    examplejs_printLines = [];
    var _ = jpacks;
    var _schema = _.object({
      type: 'uint8',
      data: _.gzip(_.shortString, 'uint16')
    });
    examplejs_print(_.stringify(_schema))
    assert.equal(examplejs_printLines.join("\n"), "object({type:'uint8',data:parse('zlib.gzipSync','zlib.gunzipSync',string('uint8'),'uint16')})"); examplejs_printLines = [];

    var buffer = _.pack(_schema, {
      type: 2,
      data: '你好世界！Hello'
    });

    examplejs_print(buffer.slice(14).join(' '));
    // windows: 2 42 0 31 139 8 0 0 0 0 0 0 11 19 121 178 119 193 211 165 123 159 236 152 246 124 106 207 251 61 141 30 169 57 57 249 0 183 181 133 147 21 0 0 0
    // linux:   2 42 0 31 139 8 0 0 0 0 0 0 3 19 121 178 119 193 211 165 123 159 236 152 246 124 106 207 251 61 141 30 169 57 57 249 0 183 181 133 147 21 0 0 0
    assert.equal(examplejs_printLines.join("\n"), "121 178 119 193 211 165 123 159 236 152 246 124 106 207 251 61 141 30 169 57 57 249 0 183 181 133 147 21 0 0 0"); examplejs_printLines = [];

    examplejs_print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(examplejs_printLines.join("\n"), "{\"type\":2,\"data\":\"你好世界！Hello\"}"); examplejs_printLines = [];

    examplejs_print(_.stringify(_.gzip(_.longString)));
    assert.equal(examplejs_printLines.join("\n"), "gzip(string('uint32'))"); examplejs_printLines = [];
  });
          
  it("inflateCreator():base", function () {
    examplejs_printLines = [];
    var _ = jpacks;
    var _schema = _.object({
      type: 'uint8',
      data: _.inflate(_.shortString, 'uint16')
    });
    examplejs_print(_.stringify(_schema))
    assert.equal(examplejs_printLines.join("\n"), "object({type:'uint8',data:parse('zlib.deflateSync','zlib.inflateSync',string('uint8'),'uint16')})"); examplejs_printLines = [];

    var buffer = _.pack(_schema, {
      type: 2,
      data: '你好世界！Hello'
    });

    examplejs_print(buffer.join(' '));
    assert.equal(examplejs_printLines.join("\n"), "2 30 0 120 156 19 121 178 119 193 211 165 123 159 236 152 246 124 106 207 251 61 141 30 169 57 57 249 0 152 20 12 247"); examplejs_printLines = [];

    examplejs_print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(examplejs_printLines.join("\n"), "{\"type\":2,\"data\":\"你好世界！Hello\"}"); examplejs_printLines = [];

    examplejs_print(_.stringify(_.inflate(_.longString)));
    assert.equal(examplejs_printLines.join("\n"), "inflate(string('uint32'))"); examplejs_printLines = [];
  });
          
});
         