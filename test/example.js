var assert = require('should');
var jpacks = require('../.');
var util = require('util');
var zlib = require('../schemas-extend/zlib');
zlib(jpacks);
var printValue;
function print(value) {
  printValue = value;
}
describe("./src/jpacks.js", function () {
});
describe("./src/schema.js", function () {
  it("together():base", function () {
    var _ = jpacks;
    function f(a, b, c) {
      print(JSON.stringify([a, b, c]));
    }
    var t = _.together(f);
    t(1)()(2, 3);
    assert.equal(printValue, '[1,2,3]')
    t(4)(5)()(6);
    assert.equal(printValue, '[4,5,6]')
    t(7, 8, 9);
    assert.equal(printValue, '[7,8,9]')
    t('a', 'b')('c');
    assert.equal(printValue, '["a","b","c"]')
    t()('x')()()('y')()()('z');
    assert.equal(printValue, '["x","y","z"]')
  });
  it("together():hook", function () {
    var _ = jpacks;
    function f(a, b, c) {}
    var t = _.together(f, function(t, args) {
      t.schema = 'f(' + args + ')';
    });
    print(t(1)(2).schema);
    // > f(1,2)
  });
});
describe("./src/schemas/array.js", function () {
  it("arrayCreator():static array", function () {
    var _ = jpacks;
    var _schema = jpacks.array('int16', 2);
    print(String(_schema));
    // > array(int16,2)
    var value = [12337, 12851];
    var buffer = jpacks.pack(_schema, value);
    print(buffer.join(' '));
    // > 48 49 50 51
    print(JSON.stringify(_.unpack(_schema, buffer)));
    // > [12337,12851]
  });
  it("arrayCreator():dynamic array", function () {
    var _ = jpacks;
    var _schema = jpacks.array('int16', 'int8');
    print(String(_schema));
    // > array(int16,int8)
    var value = [12337, 12851];
    var buffer = jpacks.pack(_schema, value);
    print(buffer.join(' '));
    // > 2 48 49 50 51
    print(JSON.stringify(_.unpack(_schema, buffer)));
    // > [12337,12851]
  });
  it("arrayCreator():dynamic array 2", function () {
    var _ = jpacks;
    var _schema = jpacks.array('int16')(6);
    print(String(_schema));
    // > array(int16,6)
    var value = [12337, 12851];
    var buffer = jpacks.pack(_schema, value);
    print(buffer.join(' '));
    // > 48 49 50 51 0 0 0 0 0 0 0 0
    print(JSON.stringify(jpacks.unpack(_schema, buffer)));
    // > [12337,12851,0,0,0,0]
  });
});
describe("./src/schemas/bytes.js", function () {
});
describe("./src/schemas/cases.js", function () {
  it("casesCreator", function () {
    var _ = jpacks;
    var _schema = {
      type: _.shortString,
      data: _.depend('type', _.cases([
        ['name', _.shortString],
        ['age', _.byte]
      ]))
    };
    print(_.stringify(_schema));
    assert.equal(printValue, '{type:string(uint8),data:depend(type,cases([[name,string(uint8)],[age,uint8]]))}')
    var buffer = _.pack(_schema, {
      type: 'name',
      data: 'tom'
    });
    print(buffer.join(' '));
    assert.equal(printValue, '4 110 97 109 101 3 116 111 109')
    print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(printValue, '{"type":"name","data":"tom"}')
    var buffer = _.pack(_schema, {
      type: 'age',
      data: 23
    });
    print(buffer.join(' '));
    assert.equal(printValue, '3 97 103 101 23')
    print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(printValue, '{"type":"age","data":23}')
  });
});
describe("./src/schemas/cstring.js", function () {
  it("cstringCreator():base", function () {
    var _ = jpacks;
    var _schema = _.cstring(32);
    print(_.stringify(_schema));
    assert.equal(printValue, 'cstring(32)')
    var buffer = _.pack(_schema, 'Hello 你好！');
    print(buffer.join(' '));
    assert.equal(printValue, '72 101 108 108 111 32 228 189 160 229 165 189 239 188 129 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0')
    print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(printValue, '"Hello 你好！"')
  });
  it("cstringCreator():pchar", function () {
    var _ = jpacks;
    var _schema = _.array(_.pchar, 'uint8');
    print(_.stringify(_schema));
    assert.equal(printValue, 'array(cstring(true),uint8)')
    var buffer = _.pack(_schema, ['abc', 'defghijk', 'g']);
    print(buffer.join(' '));
    assert.equal(printValue, '3 97 98 99 0 100 101 102 103 104 105 106 107 0 103 0')
    print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(printValue, '["abc","defghijk","g"]')
  });
});
describe("./src/schemas/depend.js", function () {
  it("dependCreator()", function () {
    var _ = jpacks;
    var _schema = _.object({
      length1: 'int8',
      length2: 'int8',
      data1: _.depend('length1', _.bytes),
      data2: _.depend('length2', _.array(_.shortString))
    });
    print(_.stringify(_schema));
    assert.equal(printValue, 'object({length1:int8,length2:int8,data1:depend(length1,bytes),data2:depend(length2,array(string(uint8)))})')
    var buffer = _.pack(_schema, {
      length1: 2,
      length2: 3,
      data1: [1, 2],
      data2: ['甲', '乙', '丙']
    });
    print(buffer.join(' '));
    assert.equal(printValue, '2 3 1 2 3 231 148 178 3 228 185 153 3 228 184 153')
    print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(printValue, '{"length1":2,"length2":3,"data1":[1,2],"data2":["甲","乙","丙"]}')
  });
});
describe("./src/schemas/enums.js", function () {
  it("enumsCreator():map is array", function () {
    var _ = jpacks;
    var _schema = _.enums(['Sun', 'Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat'], 'uint8');
    print(_.stringify(_schema));
    assert.equal(printValue, 'enums({Sun:0,Mon:1,Tues:2,Wed:3,Thur:4,Fri:5,Sat:6},uint8)')
    var buffer = _.pack(_schema, 'Tues');
    print(buffer.join(' '));
    assert.equal(printValue, '2')
    print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(printValue, '"Tues"')
  });
  it("enumsCreator():map is object", function () {
    var _ = jpacks;
    var _schema = _.enums({
      Unknown: -1,
      Continue: 100,
      Processing: 100,
      OK: 200,
      Created: 201,
      NotFound: 404
    }, 'int8');
    print(_.stringify(_schema));
    assert.equal(printValue, 'enums({Unknown:-1,Continue:100,Processing:100,OK:200,Created:201,NotFound:404},int8)')
    var buffer = _.pack(_schema, 'Unknown');
    print(buffer.join(' '));
    assert.equal(printValue, '255')
    print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(printValue, '"Unknown"')
  });
  it("enumsCreator():fault tolerant", function () {
    var _ = jpacks;
    var _schema = _.enums({
      Unknown: -1,
      Continue: 100,
      Processing: 100,
      OK: 200,
      Created: 201,
      NotFound: 404
    }, 'int8');
    print(_.stringify(_schema));
    assert.equal(printValue, 'enums({Unknown:-1,Continue:100,Processing:100,OK:200,Created:201,NotFound:404},int8)')
    var buffer = _.pack(_schema, 2);
    print(buffer.join(' '));
    assert.equal(printValue, '2')
    print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(printValue, '2')
});
describe("./src/schemas/number.js", function () {
    var _ = jpacks;
    var _map = {};
    'int8,int16,int32,uint8,uint16,uint32,float32,float64,shortint,smallint,longint,byte,word,longword'.split(/,/).forEach(function (item) {
      _map[item] = item;
    });
    var _schema = _.union(_map, 8);
    print(_.stringify(_schema));
    assert.equal(printValue, 'union({int8:int8,int16:int16,int32:int32,uint8:uint8,uint16:uint16,uint32:uint32,float32:float32,float64:float64,shortint:shortint,smallint:smallint,longint:longint,byte:byte,word:word,longword:longword},8)')
    var buffer = _.pack(_schema, {
      float64: 2.94296650666094e+189
    });
    print(buffer.join(' '));
    assert.equal(printValue, '16 52 86 120 1 35 69 103')
    print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(printValue, '{"int8":16,"int16":13328,"int32":2018915344,"uint8":16,"uint16":13328,"uint32":2018915344,"float32":1.7378241885569425e+34,"float64":2.94296650666094e+189,"shortint":16,"smallint":13328,"longint":2018915344,"byte":16,"word":13328,"longword":2018915344}')
  });
});
describe("./src/schemas/object.js", function () {
  it("objectCreator:array", function () {
    var _ = jpacks;
    var _schema = _.object([_.shortString, _.word]);
    print(_.stringify(_schema));
    assert.equal(printValue, 'object([string(uint8),uint16])')
    var buffer = _.pack(_schema, ['zswang', 1978]);
    print(buffer.join(' '));
    assert.equal(printValue, '6 122 115 119 97 110 103 186 7')
    print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(printValue, '["zswang",1978]')
  });
  it("objectCreator:object", function () {
    var _ = jpacks;
    var _schema = _.object({
      name: _.shortString,
      year: _.word
    });
    print(_.stringify(_schema));
    assert.equal(printValue, 'object({namespace:string,args:{0:uint8}})')
    var buffer = _.pack(_schema, {
        name: 'zswang',
        year: 1978
      });
    print(buffer.join(' '));
    assert.equal(printValue, '6 122 115 119 97 110 103 186 7')
    print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(printValue, '{"name":"zswang","year":1978}')
  });
});
describe("./src/schemas/parse.js", function () {
  it("parseCreator():_xor", function () {
    var _ = jpacks;
    var _xor = function _xor(buffer) {
      return buffer.slice().map(function (item) {
        return item ^ 127;
      });
    };
    var _schema = _.parse(_xor, _xor, 'float64', 8);
    print(_.stringify(_schema));
    assert.equal(printValue, 'parse(_xor,_xor,float64,8)')
    var buffer = _.pack(_schema, 2.94296650666094e+189);
    print(buffer.join(' '));
    assert.equal(printValue, '111 75 41 7 126 92 58 24')
    print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(printValue, '2.94296650666094e+189')
  });
});
describe("./src/schemas/string.js", function () {
});
describe("./src/schemas/union.js", function () {
  it("unionCreator():base", function () {
    var _ = jpacks;
    var _schema = _.union({
      length: _.byte,
      content: _.shortString
    }, 20);
    print(_.stringify(_schema));
    assert.equal(printValue, 'union({length:uint8,content:string(uint8)},20)')
    var buffer = _.pack(_schema, {
      content: '0123456789'
    });
    print(buffer.join(' '));
    assert.equal(printValue, '10 48 49 50 51 52 53 54 55 56 57 0 0 0 0 0 0 0 0 0')
    print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(printValue, '{"length":10,"content":"0123456789"}')
  });
});
describe("schemas-extend/zlib.js", function () {
  it("gzipCreator():base", function () {
    var _ = jpacks;
    var _schema = _.object({
      type: 'uint8',
      data: _.gzip(_.shortString, 'uint16')
    });
    print(_.stringify(_schema))
    var buffer = _.pack(_schema, {
      type: 2,
      data: '你好世界！Hello'
    });
    print(buffer.join(' '));
    print(_.unpack(_schema, buffer));
  });
  it("inflateCreator():base", function () {
    var _ = jpacks;
    var _schema = _.object({
      type: 'uint8',
      data: _.inflate(_.shortString, 'uint16')
    });
    print(_.stringify(_schema))
    var buffer = _.pack(_schema, {
      type: 2,
      data: '你好世界！Hello'
    });
    print(buffer.join(' '));
    print(_.unpack(_schema, buffer));
  });
});
