var assert = require('should');
var jpacks = require('../.');
var util = require('util');
var printValue;
function print(value) {
  if (typeof printValue !== 'undefined') {
    throw new Error('Test case does not match.');
  }
  printValue = value;
}
jpacks.setDefaultOptions({
  browser: true
});
  require('.././schemas-extend/bigint')(jpacks);
  require('.././schemas-extend/protobuf')(jpacks);
  require('.././schemas-extend/zlib')(jpacks);
describe("./src/jpacks.js", function () {
  printValue = undefined;
});
describe("./src/schema.js", function () {
  printValue = undefined;
  it("together():base", function () {
    var _ = jpacks;
    function f(a, b, c) {
      print(JSON.stringify([a, b, c]));
    }
    var t = _.together(f);
    t(1)()(2, 3);
    assert.equal(printValue, "[1,2,3]"); printValue = undefined;
    t(4)(5)()(6);
    assert.equal(printValue, "[4,5,6]"); printValue = undefined;
    t(7, 8, 9);
    assert.equal(printValue, "[7,8,9]"); printValue = undefined;
    t('a', 'b')('c');
    assert.equal(printValue, "[\"a\",\"b\",\"c\"]"); printValue = undefined;
    t()('x')()()('y')()()('z');
    assert.equal(printValue, "[\"x\",\"y\",\"z\"]"); printValue = undefined;
  });
  it("together():hook", function () {
    var _ = jpacks;
    function f(a, b, c) {}
    var t = _.together(f, function(t, args) {
      t.schema = 'f(' + args + ')';
    });
    print(t(1)(2).schema);
    assert.equal(printValue, "f(1,2)"); printValue = undefined;
    function go() {
      print(1);
    }
    var g = _.together(go);
    g();
    assert.equal(printValue, "1"); printValue = undefined;
  });
});
describe("./src/schemas/array.js", function () {
  printValue = undefined;
  it("arrayCreator():static array", function () {
    var _ = jpacks;
    var _schema = jpacks.array('int16', 2);
    print(String(_schema));
    assert.equal(printValue, "array('int16',2)"); printValue = undefined;
    var value = [12337, 12851];
    var buffer = jpacks.pack(_schema, value);
    print(buffer.join(' '));
    assert.equal(printValue, "49 48 51 50"); printValue = undefined;
    print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(printValue, "[12337,12851]"); printValue = undefined;
  });
  it("arrayCreator():dynamic array", function () {
    var _ = jpacks;
    var _schema = jpacks.array('int16', 'int8');
    print(String(_schema));
    assert.equal(printValue, "array('int16','int8')"); printValue = undefined;
    var value = [12337, 12851];
    var buffer = jpacks.pack(_schema, value);
    print(buffer.join(' '));
    assert.equal(printValue, "2 49 48 51 50"); printValue = undefined;
    print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(printValue, "[12337,12851]"); printValue = undefined;
  });
  it("arrayCreator():dynamic array 2", function () {
    var _ = jpacks;
    var _schema = jpacks.array('int16')(6);
    print(String(_schema));
    assert.equal(printValue, "array('int16',6)"); printValue = undefined;
    var value = [12337, 12851];
    var buffer = jpacks.pack(_schema, value);
    print(buffer.join(' '));
    assert.equal(printValue, "49 48 51 50 0 0 0 0 0 0 0 0"); printValue = undefined;
    print(JSON.stringify(jpacks.unpack(_schema, buffer)));
    assert.equal(printValue, "[12337,12851,0,0,0,0]"); printValue = undefined;
  });
  it("arrayCreator():auto size int8", function () {
    var _ = jpacks;
    var _schema = _.array('int8', null);
    print(_.stringify(_schema))
    assert.equal(printValue, "array('int8',null)"); printValue = undefined;
    var buffer = _.pack(_schema, [0, 1, 2, 3, 4, 5, 6, 7]);
    print(buffer.join(' '));
    assert.equal(printValue, "0 1 2 3 4 5 6 7"); printValue = undefined;
    print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(printValue, "[0,1,2,3,4,5,6,7]"); printValue = undefined;
  });
  it("arrayCreator():auto size int16 littleEndian = true", function () {
    var _ = jpacks;
    var _schema = _.array('int16', null);
    var options = {
      littleEndian: true
    };
    print(_.stringify(_schema))
    assert.equal(printValue, "array('int16',null)"); printValue = undefined;
    var buffer = _.pack(_schema, [0, 1, 2, 3, 4, 5, 6, 7], options);
    print(buffer.join(' '));
    assert.equal(printValue, "0 0 1 0 2 0 3 0 4 0 5 0 6 0 7 0"); printValue = undefined;
    print(JSON.stringify(_.unpack(_schema, buffer, options)));
    assert.equal(printValue, "[0,1,2,3,4,5,6,7]"); printValue = undefined;
  });
  it("arrayCreator():auto size int16 littleEndian = false", function () {
    var _ = jpacks;
    var _schema = _.array('int16', null);
    var options = {
      littleEndian: false
    };
    print(_.stringify(_schema))
    assert.equal(printValue, "array('int16',null)"); printValue = undefined;
    var buffer = _.pack(_schema, [0, 1, 2, 3, 4, 5, 6, 7], options);
    print(buffer.join(' '));
    assert.equal(printValue, "0 0 0 1 0 2 0 3 0 4 0 5 0 6 0 7"); printValue = undefined;
    print(JSON.stringify(_.unpack(_schema, buffer, options)));
    assert.equal(printValue, "[0,1,2,3,4,5,6,7]"); printValue = undefined;
  });
  it("arrayCreator():size fault tolerant", function () {
    var _ = jpacks;
    var _schema = _.array('int8', 4);
    print(_.stringify(_schema))
    assert.equal(printValue, "array('int8',4)"); printValue = undefined;
    var buffer = _.pack(_schema, [0, 1, 2, 3, 4, 5, 6, 7]);
    print(buffer.join(' '));
    assert.equal(printValue, "0 1 2 3"); printValue = undefined;
    print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(printValue, "[0,1,2,3]"); printValue = undefined;
    var buffer = _.pack(_schema, [0, 1, 2]);
    print(buffer.join(' '));
    assert.equal(printValue, "0 1 2 0"); printValue = undefined;
    print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(printValue, "[0,1,2,0]"); printValue = undefined;
  });
  it("arrayCreator():defaultOptions & littleEndian", function () {
    var _ = jpacks;
    var _schema = _.array('int16', 7);
    _schema.defaultOptions = {
      littleEndian: false
    };
    var buffer = _.pack(_schema, [1, 2, 3, 4, 5, 6, 7]);
    print(buffer.join(' '));
    assert.equal(printValue, "0 1 0 2 0 3 0 4 0 5 0 6 0 7"); printValue = undefined;
    _schema.defaultOptions = {
      littleEndian: true
    };
    var buffer = _.pack(_schema, [1, 2, 3, 4, 5, 6, 7]);
    print(buffer.join(' '));
    assert.equal(printValue, "1 0 2 0 3 0 4 0 5 0 6 0 7 0"); printValue = undefined;
  });
});
describe("./src/schemas/bytes.js", function () {
  printValue = undefined;
  it("bytes()", function () {
    var _ = jpacks;
    var _schema = jpacks.bytes(6);
    print(String(_schema));
    assert.equal(printValue, "array('uint8',6)"); printValue = undefined;
    var value = [0, 1, 2, 3, 4, 5];
    var buffer = jpacks.pack(_schema, value);
    print(buffer.join(' '));
    assert.equal(printValue, "0 1 2 3 4 5"); printValue = undefined;
    print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(printValue, "[0,1,2,3,4,5]"); printValue = undefined;
  });
  it("bytes() auto size", function () {
    var _ = jpacks;
    var _schema = jpacks.bytes(null);
    print(String(_schema));
    assert.equal(printValue, "array('uint8',null)"); printValue = undefined;
    var value = [0, 1, 2, 3, 4, 5];
    var buffer = jpacks.pack(_schema, value);
    print(buffer.join(' '));
    assert.equal(printValue, "0 1 2 3 4 5"); printValue = undefined;
    print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(printValue, "[0,1,2,3,4,5]"); printValue = undefined;
  });
});
describe("./src/schemas/cstring.js", function () {
  printValue = undefined;
  it("cstringCreator():base", function () {
    var _ = jpacks;
    var _schema = _.cstring(32);
    print(_.stringify(_schema));
    assert.equal(printValue, "cstring(32)"); printValue = undefined;
    var buffer = _.pack(_schema, 'Hello 你好！');
    print(buffer.join(' '));
    assert.equal(printValue, "72 101 108 108 111 32 228 189 160 229 165 189 239 188 129 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0"); printValue = undefined;
    print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(printValue, "\"Hello 你好！\""); printValue = undefined;
  });
  it("cstringCreator():auto size", function () {
    var _ = jpacks;
    var _schema = _.cstring(null);
    print(_.stringify(_schema));
    assert.equal(printValue, "cstring(null)"); printValue = undefined;
    var buffer = _.pack(_schema, 'Hello 你好！');
    print(buffer.join(' '));
    assert.equal(printValue, "72 101 108 108 111 32 228 189 160 229 165 189 239 188 129 0"); printValue = undefined;
    print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(printValue, "\"Hello 你好！\""); printValue = undefined;
  });
  it("cstringCreator():pchar", function () {
    var _ = jpacks;
    var _schema = _.array(_.pchar, 'uint8');
    print(_.stringify(_schema));
    assert.equal(printValue, "array(cstring(null),'uint8')"); printValue = undefined;
    var buffer = _.pack(_schema, ['abc', 'defghijk', 'g']);
    print(buffer.join(' '));
    assert.equal(printValue, "3 97 98 99 0 100 101 102 103 104 105 106 107 0 103 0"); printValue = undefined;
    print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(printValue, "[\"abc\",\"defghijk\",\"g\"]"); printValue = undefined;
  });
});
describe("./src/schemas/depend.js", function () {
  printValue = undefined;
  it("dependCreator():base", function () {
    var _ = jpacks;
    var _schema = _.object({
      length1: 'int8',
      length2: 'int8',
      data1: _.depend('length1', _.bytes),
      data2: _.depend('length2', _.array(_.shortString))
    });
    print(_.stringify(_schema));
    assert.equal(printValue, "object({length1:'int8',length2:'int8',data1:depend('length1','bytes'),data2:depend('length2',array(string('uint8')))})"); printValue = undefined;
    var buffer = _.pack(_schema, {
      length1: 2,
      length2: 3,
      data1: [1, 2],
      data2: ['甲', '乙', '丙']
    });
    print(buffer.join(' '));
    assert.equal(printValue, "2 3 1 2 3 231 148 178 3 228 185 153 3 228 184 153"); printValue = undefined;
    print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(printValue, "{\"length1\":2,\"length2\":3,\"data1\":[1,2],\"data2\":[\"甲\",\"乙\",\"丙\"]}"); printValue = undefined;
  });
});
describe("./src/schemas/enums.js", function () {
  printValue = undefined;
  it("enumsCreator():map is array", function () {
    var _ = jpacks;
    var _schema = _.enums(['Sun', 'Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat'], 'uint8');
    print(_.stringify(_schema));
    assert.equal(printValue, "enums({Sun:0,Mon:1,Tues:2,Wed:3,Thur:4,Fri:5,Sat:6},'uint8')"); printValue = undefined;
    var buffer = _.pack(_schema, 'Tues');
    print(buffer.join(' '));
    assert.equal(printValue, "2"); printValue = undefined;
    print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(printValue, "\"Tues\""); printValue = undefined;
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
    assert.equal(printValue, "enums({Unknown:-1,Continue:100,Processing:100,OK:200,Created:201,NotFound:404},'int8')"); printValue = undefined;
    var buffer = _.pack(_schema, 'Unknown');
    print(buffer.join(' '));
    assert.equal(printValue, "255"); printValue = undefined;
    print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(printValue, "\"Unknown\""); printValue = undefined;
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
    assert.equal(printValue, "enums({Unknown:-1,Continue:100,Processing:100,OK:200,Created:201,NotFound:404},'int8')"); printValue = undefined;
    var buffer = _.pack(_schema, 2);
    print(buffer.join(' '));
    assert.equal(printValue, "2"); printValue = undefined;
    print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(printValue, "2"); printValue = undefined;
  });
});
describe("./src/schemas/exit.js", function () {
  printValue = undefined;
  it("exitCreator():base", function () {
    var _ = jpacks;
    var _schema = _.object({
      a: _.int8,
      b: _.int8,
      c: _.exit(),
      d: _.int8,
      e: _.int8
    });
    print(_.stringify(_schema));
    assert.equal(printValue, "object({a:'int8',b:'int8',c:exit(),d:'int8',e:'int8'})"); printValue = undefined;
    var buffer = _.pack(_schema, {
      a: 1,
      b: 2,
      c: 3,
      d: 4,
      e: 5
    });
    print(buffer.join(' '));
    assert.equal(printValue, "1 2"); printValue = undefined;
    print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(printValue, "{\"a\":1,\"b\":2,\"c\":null,\"d\":null,\"e\":null}"); printValue = undefined;
  });
  it("exitCreator():depend", function () {
    var _ = jpacks;
    _.def('A', {
      a: _.int8,
      b: _.depend('a', function (a) {
        return a === 1 ? _.int8 : _.exit();
      }),
      c: _.int8,
    });
    var _schema = _.object({
      f1: 'A',
      f2: 'A'
    })
    print(_.stringify(_schema));
    assert.equal(printValue, "object({f1:'A',f2:'A'})"); printValue = undefined;
    var buffer = _.pack(_schema, {
      f1: {
        a: 1,
        b: 1,
        c: 2
      },
      f2: {
        a: 0,
        b: 1,
        c: 2
      }
    });
    print(buffer.join(' '));
    assert.equal(printValue, "1 1 2 0"); printValue = undefined;
    print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(printValue, "{\"f1\":{\"a\":1,\"b\":1,\"c\":2},\"f2\":{\"a\":0,\"b\":null,\"c\":null}}"); printValue = undefined;
  });
});
describe("./src/schemas/link.js", function () {
  printValue = undefined;
  it("linkCreator():base", function () {
    var _ = jpacks;
    var _schema = {
      size1: 'uint16',
      size2: 'uint16',
      data1: _.link('size1', 'uint8'),
      data2: _.link('size2', 'uint8')
    };
    print(_.stringify(_schema));
    assert.equal(printValue, "{size1:'uint16',size2:'uint16',data1:link('size1','uint8'),data2:link('size2','uint8')}"); printValue = undefined;
    var buffer = jpacks.pack(_schema, {
      data1: [1, 2, 3, 4],
      data2: [1, 2, 3, 4, 5, 6, 7, 8],
    });
    print(buffer.join(' '));
    assert.equal(printValue, "4 0 8 0 1 2 3 4 1 2 3 4 5 6 7 8"); printValue = undefined;
    print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(printValue, "{\"size1\":4,\"size2\":8,\"data1\":[1,2,3,4],\"data2\":[1,2,3,4,5,6,7,8]}"); printValue = undefined;
  });
});
describe("./src/schemas/merge.js", function () {
  printValue = undefined;
  it("mergeCreator:base", function () {
    var _ = jpacks;
    _.def('structA', {
      a: _.int8,
      b: _.int8
    });
    _.def('structB', {
      c: _.int8,
      d: _.int8
    });
    var _schema = _.merge(
      ['structA', 'structB']
    );
    print(_.stringify(_schema))
    assert.equal(printValue, "object({a:'int8',b:'int8',c:'int8',d:'int8'})"); printValue = undefined;
    var buffer = _.pack(_schema, {
      a: 1,
      b: 2,
      c: 3,
      d: 4
    });
    print(buffer.join(' '));
    assert.equal(printValue, "1 2 3 4"); printValue = undefined;
    print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(printValue, "{\"a\":1,\"b\":2,\"c\":3,\"d\":4}"); printValue = undefined;
  });
});
describe("./src/schemas/number.js", function () {
  printValue = undefined;
  it("all number", function () {
    var _ = jpacks;
    var _map = {
      bytes: _.bytes(8)
    };
    'int8,int16,int32,uint8,uint16,uint32,float32,float64,shortint,smallint,longint,byte,word,longword'.split(/,/).forEach(function (item) {
      _map[item] = item;
    });
    var _schema = _.union(_map, 8);
    print(_.stringify(_schema));
    assert.equal(printValue, "union({bytes:array('uint8',8),int8:'int8',int16:'int16',int32:'int32',uint8:'uint8',uint16:'uint16',uint32:'uint32',float32:'float32',float64:'float64',shortint:'shortint',smallint:'smallint',longint:'longint',byte:'byte',word:'word',longword:'longword'},8)"); printValue = undefined;
    var buffer = _.pack(_schema, {
      bytes: [0x12, 0x23, 0x34, 0x45, 0x56, 0x67, 0x78, 0x89]
    });
    print(buffer.join(' '));
    assert.equal(printValue, "18 35 52 69 86 103 120 137"); printValue = undefined;
    print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(printValue, "{\"bytes\":[18,35,52,69,86,103,120,137],\"int8\":18,\"int16\":8978,\"int32\":1161044754,\"uint8\":18,\"uint16\":8978,\"uint32\":1161044754,\"float32\":2882.19189453125,\"float64\":-4.843717058781651e-263,\"shortint\":18,\"smallint\":8978,\"longint\":1161044754,\"byte\":18,\"word\":8978,\"longword\":1161044754}"); printValue = undefined;
  });
});
describe("./src/schemas/object.js", function () {
  printValue = undefined;
  it("objectCreator:array", function () {
    var _ = jpacks;
    var _schema = _.object([_.shortString, _.word]);
    print(_.stringify(_schema));
    assert.equal(printValue, "object([string('uint8'),'uint16'])"); printValue = undefined;
    var buffer = _.pack(_schema, ['zswang', 1978]);
    print(buffer.join(' '));
    assert.equal(printValue, "6 122 115 119 97 110 103 186 7"); printValue = undefined;
    print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(printValue, "[\"zswang\",1978]"); printValue = undefined;
  });
  it("objectCreator:object", function () {
    var _ = jpacks;
    var _schema = _.object({
      name: _.shortString,
      year: _.word
    });
    print(_.stringify(_schema));
    assert.equal(printValue, "object({name:string('uint8'),year:'uint16'})"); printValue = undefined;
    var buffer = _.pack(_schema, {
        name: 'zswang',
        year: 1978
      });
    print(buffer.join(' '));
    assert.equal(printValue, "6 122 115 119 97 110 103 186 7"); printValue = undefined;
    print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(printValue, "{\"name\":\"zswang\",\"year\":1978}"); printValue = undefined;
  });
  it("objectCreator:null", function () {
    var _ = jpacks;
    var _schema = _.object({
      n1: null,
      n2: null,
      s1: _.int8
    });
    print(_.stringify(_schema));
    assert.equal(printValue, "object({n1:null,n2:null,s1:'int8'})"); printValue = undefined;
    var buffer = _.pack(_schema, {
        n1: 1,
        n2: 2,
        s1: 1
      });
    print(buffer.join(' '));
    assert.equal(printValue, "1"); printValue = undefined;
    print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(printValue, "{\"n1\":null,\"n2\":null,\"s1\":1}"); printValue = undefined;
  });
});
describe("./src/schemas/parse.js", function () {
  printValue = undefined;
  it("parseCreator():_xor", function () {
    var _ = jpacks;
    var _xor = function _xor(buffer) {
      return buffer.slice().map(function (item) {
        return item ^ 127;
      });
    };
    var _schema = _.parse(_xor, _xor, 'float64', 8);
    print(_.stringify(_schema));
    assert.equal(printValue, "parse('_xor','_xor','float64',8)"); printValue = undefined;
    var buffer = _.pack(_schema, 2.94296650666094e+189);
    print(buffer.join(' '));
    assert.equal(printValue, "111 75 41 7 126 92 58 24"); printValue = undefined;
    print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(printValue, "2.94296650666094e+189"); printValue = undefined;
  });
});
describe("./src/schemas/string.js", function () {
  printValue = undefined;
});
describe("./src/schemas/union.js", function () {
  printValue = undefined;
  it("unionCreator():base", function () {
    var _ = jpacks;
    var _schema = _.union({
      length: _.byte,
      content: _.shortString
    }, 20);
    print(_.stringify(_schema));
    assert.equal(printValue, "union({length:'uint8',content:string('uint8')},20)"); printValue = undefined;
    var buffer = _.pack(_schema, {
      content: '0123456789'
    });
    print(buffer.join(' '));
    assert.equal(printValue, "10 48 49 50 51 52 53 54 55 56 57 0 0 0 0 0 0 0 0 0"); printValue = undefined;
    print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(printValue, "{\"length\":10,\"content\":\"0123456789\"}"); printValue = undefined;
  });
});
describe("./src/schemas/virtual.js", function () {
  printValue = undefined;
  it("virtualCreator:number", function () {
    var _ = jpacks;
    var _schema = _.object({
      f1: 'uint16',
      v1: _.depend('f1', _.virtual(-4))
    });
    print(_.stringify(_schema))
    assert.equal(printValue, "object({f1:'uint16',v1:depend('f1',virtual(-4))})"); printValue = undefined;
    var buffer = _.pack(_schema, {
      f1: 4
    });
    print(buffer.join(' '));
    assert.equal(printValue, "4 0"); printValue = undefined;
    print(JSON.stringify(_.unpack(_schema, buffer, { littleEndian: false })));
    assert.equal(printValue, "{\"f1\":1024,\"v1\":1020}"); printValue = undefined;
  });
  it("virtualCreator:string", function () {
    var _ = jpacks;
    var _schema = _.object({
      name: _.shortString,
      welcome: _.depend('name', _.virtual('Hello '))
    });
    print(_.stringify(_schema))
    assert.equal(printValue, "object({name:string('uint8'),welcome:depend('name',virtual('Hello '))})"); printValue = undefined;
    var buffer = _.pack(_schema, {
      name: 'World!'
    });
    print(buffer.join(' '));
    assert.equal(printValue, "6 87 111 114 108 100 33"); printValue = undefined;
    print(JSON.stringify(_.unpack(_schema, buffer, { littleEndian: false })));
    assert.equal(printValue, "{\"name\":\"World!\",\"welcome\":\"Hello World!\"}"); printValue = undefined;
  });
  it("virtualCreator:depend", function () {
    var _ = jpacks;
    var _schema = _.object({
      name: _.shortString,
      welcome: _.depend('name', function (name) {
        switch (name) {
          case 'zswang':
            return _.depend('name', _.virtual('Hello '));
          case 'wang':
            return _.depend('name', _.virtual('Hi '));
        }
      })
    });
    print(_.stringify(_schema))
    assert.equal(printValue, "object({name:string('uint8'),welcome:depend('name',$fn)})"); printValue = undefined;
    var buffer = _.pack(_schema, {
      name: 'zswang'
    });
    print(buffer.join(' '));
    assert.equal(printValue, "6 122 115 119 97 110 103"); printValue = undefined;
    print(JSON.stringify(_.unpack(_schema, buffer, { littleEndian: false })));
    assert.equal(printValue, "{\"name\":\"zswang\",\"welcome\":\"Hello zswang\"}"); printValue = undefined;
    var buffer = _.pack(_schema, {
      name: 'wang'
    });
    print(buffer.join(' '));
    assert.equal(printValue, "4 119 97 110 103"); printValue = undefined;
    print(JSON.stringify(_.unpack(_schema, buffer, { littleEndian: false })));
    assert.equal(printValue, "{\"name\":\"wang\",\"welcome\":\"Hi wang\"}"); printValue = undefined;
  });
});
describe("./schemas-extend/bigint.js", function () {
  printValue = undefined;
  it("uint64():string", function () {
    var _ = jpacks;
    var _schema = _.uint64;
    print(_.stringify(_schema))
    assert.equal(printValue, "'uint64'"); printValue = undefined;
    var buffer = _.pack(_schema, '1609531171697315243');
    print(buffer.join(' '));
    assert.equal(printValue, "171 205 239 175 18 52 86 22"); printValue = undefined;
    print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(printValue, "\"1609531171697315243\""); printValue = undefined;
  });
  it("uint64():number", function () {
    var _ = jpacks;
    var _schema = _.uint64;
    print(_.stringify(_schema))
    assert.equal(printValue, "'uint64'"); printValue = undefined;
    var buffer = _.pack(_schema, 171697315);
    print(buffer.join(' '));
    assert.equal(printValue, "163 228 59 10 0 0 0 0"); printValue = undefined;
    print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(printValue, "\"171697315\""); printValue = undefined;
  });
  it("uint64():littleEndian = false;", function () {
    var _ = jpacks;
    var _schema = _.uint64;
    print(_.stringify(_schema))
    assert.equal(printValue, "'uint64'"); printValue = undefined;
    var buffer = _.pack(_schema, 171697315, { littleEndian: false });
    print(buffer.join(' '));
    assert.equal(printValue, "0 0 0 0 10 59 228 163"); printValue = undefined;
    print(JSON.stringify(_.unpack(_schema, buffer, { littleEndian: false })));
    assert.equal(printValue, "\"171697315\""); printValue = undefined;
  });
  it("int64():-1,-2", function () {
    var _ = jpacks;
    var _schema = _.int64;
    print(_.stringify(_schema))
    assert.equal(printValue, "'int64'"); printValue = undefined;
    var buffer = _.pack(_schema, '-1');
    print(buffer.join(' '));
    assert.equal(printValue, "255 255 255 255 255 255 255 255"); printValue = undefined;
    print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(printValue, "\"-1\""); printValue = undefined;
    var buffer = _.pack(_schema, '-2');
    print(buffer.join(' '));
    assert.equal(printValue, "254 255 255 255 255 255 255 255"); printValue = undefined;
    print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(printValue, "\"-2\""); printValue = undefined;
  });
  it("int64():-2, littleEndian = false", function () {
    var _ = jpacks;
    var _schema = _.int64;
    print(_.stringify(_schema))
    assert.equal(printValue, "'int64'"); printValue = undefined;
    var buffer = _.pack(_schema, -2, { littleEndian: false });
    print(buffer.join(' '));
    assert.equal(printValue, "255 255 255 255 255 255 255 254"); printValue = undefined;
    print(JSON.stringify(_.unpack(_schema, buffer, { littleEndian: false })));
    assert.equal(printValue, "\"-2\""); printValue = undefined;
  });
});
describe("./schemas-extend/protobuf.js", function () {
  printValue = undefined;
  it("protobufCreator():base", function () {
    var _ = jpacks;
    var _schema = _.array(
      _.protobuf('test/protoify/json.proto', 'js.Value', 'uint16'),
      'int8'
    );
    print(_.stringify(_schema))
    assert.equal(printValue, "array(protobuf('test/protoify/json.proto','js.Value','uint16'),'int8')"); printValue = undefined;
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
    print(buffer.join(' '));
    assert.equal(printValue, "2 3 0 8 246 1 33 0 58 31 10 6 26 4 110 97 109 101 10 6 26 4 121 101 97 114 18 8 26 6 122 115 119 97 110 103 18 3 8 190 31"); printValue = undefined;
    print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(printValue, "[{\"integer\":123},{\"object\":{\"keys\":[{\"string\":\"name\"},{\"string\":\"year\"}],\"values\":[{\"string\":\"zswang\"},{\"integer\":2015}]}}]"); printValue = undefined;
  });
  it("protobufCreator():bigint", function () {
    var _ = jpacks;
    var _schema = _.array(
      _.protobuf('test/protoify/bigint.proto', 'bigint.Value', 'uint16'),
      'int8'
    );
    print(_.stringify(_schema))
    assert.equal(printValue, "array(protobuf('test/protoify/bigint.proto','bigint.Value','uint16'),'int8')"); printValue = undefined;
    var buffer = _.pack(_schema, [{
      int64: "-192377746236123"
    }, {
      uint64: "192377746236123"
    }]);
    print(buffer.join(' '));
    assert.equal(printValue, "2 11 0 8 165 186 151 134 137 161 212 255 255 1 8 0 16 219 197 232 249 246 222 43"); printValue = undefined;
    print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(printValue, "[{\"int64\":\"-192377746236123\"},{\"uint64\":\"192377746236123\"}]"); printValue = undefined;
  });
  it("protobufCreator():bytesAsString", function () {
    var _ = jpacks;
    var _schema = _.array(
      _.protobuf('test/protoify/string.proto', 'str.Value', 'uint16'),
      'int8'
    );
    print(_.stringify(_schema))
    assert.equal(printValue, "array(protobuf('test/protoify/string.proto','str.Value','uint16'),'int8')"); printValue = undefined;
    _.setDefaultOptions({
      protobuf_bytesAsString: true
    });
    var buffer = _.pack(_schema, [{
      string: "Hello World!你好世界!"
    }, {
      bytes: "你好世界!Hello World!"
    }]);
    print(buffer.join(' '));
    assert.equal(printValue, "2 27 0 10 25 72 101 108 108 111 32 87 111 114 108 100 33 228 189 160 229 165 189 228 184 150 231 149 140 33 27 0 18 25 228 189 160 229 165 189 228 184 150 231 149 140 33 72 101 108 108 111 32 87 111 114 108 100 33"); printValue = undefined;
    print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(printValue, "[{\"string\":\"Hello World!你好世界!\"},{\"bytes\":\"你好世界!Hello World!\"}]"); printValue = undefined;
  });
  it("protobufCreator():proto text", function () {
    var _ = jpacks;
    var _schema = _.array(
      _.protobuf('message Value { required string text = 1; }', 'Value', 'uint16'),
      'int8'
    );
    print(_.stringify(_schema))
    assert.equal(printValue, "array(protobuf('message Value { required string text = 1; }','Value','uint16'),'int8')"); printValue = undefined;
    _.setDefaultOptions({
      protobuf_bytesAsString: true
    });
    var buffer = _.pack(_schema, [{
      text: "a"
    }, {
      text: "b"
    }]);
    print(buffer.join(' '));
    assert.equal(printValue, "2 3 0 10 1 97 3 0 10 1 98"); printValue = undefined;
    print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(printValue, "[{\"text\":\"a\"},{\"text\":\"b\"}]"); printValue = undefined;
  });
  it("protobufCreator():repeated bytes", function () {
    var _ = jpacks;
    var _schema =
      _.protobuf('message BytesArray { repeated bytes items = 1; }', 'BytesArray', 'uint16');
    print(_.stringify(_schema))
    assert.equal(printValue, "protobuf('message BytesArray { repeated bytes items = 1; }','BytesArray','uint16')"); printValue = undefined;
    _.setDefaultOptions({
      protobuf_bytesAsString: false
    });
    var buffer = _.pack(_schema, {
      items: [[1, 2, 3, 4], [5, 6, 7, 8], '12345678']
    });
    print(buffer.join(' '));
    assert.equal(printValue, "22 0 10 4 1 2 3 4 10 4 5 6 7 8 10 8 49 50 51 52 53 54 55 56"); printValue = undefined;
    print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(printValue, "{\"items\":[[1,2,3,4],[5,6,7,8],[49,50,51,52,53,54,55,56]]}"); printValue = undefined;
  });
});
describe("./schemas-extend/zlib.js", function () {
  printValue = undefined;
  it("gzipCreator():base", function () {
    var _ = jpacks;
    var _schema = _.object({
      type: 'uint8',
      data: _.gzip(_.shortString, 'uint16')
    });
    print(_.stringify(_schema))
    assert.equal(printValue, "object({type:'uint8',data:parse('zlib.gzipSync','zlib.gunzipSync',string('uint8'),'uint16')})"); printValue = undefined;
    var buffer = _.pack(_schema, {
      type: 2,
      data: '你好世界！Hello'
    });
    print(buffer.slice(14).join(' '));
    // windows: 2 42 0 31 139 8 0 0 0 0 0 0 11 19 121 178 119 193 211 165 123 159 236 152 246 124 106 207 251 61 141 30 169 57 57 249 0 183 181 133 147 21 0 0 0
    // linux:   2 42 0 31 139 8 0 0 0 0 0 0 3 19 121 178 119 193 211 165 123 159 236 152 246 124 106 207 251 61 141 30 169 57 57 249 0 183 181 133 147 21 0 0 0
    assert.equal(printValue, "121 178 119 193 211 165 123 159 236 152 246 124 106 207 251 61 141 30 169 57 57 249 0 183 181 133 147 21 0 0 0"); printValue = undefined;
    print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(printValue, "{\"type\":2,\"data\":\"你好世界！Hello\"}"); printValue = undefined;
    print(_.stringify(_.gzip(_.longString)));
    assert.equal(printValue, "gzip(string('uint32'))"); printValue = undefined;
  });
  it("inflateCreator():base", function () {
    var _ = jpacks;
    var _schema = _.object({
      type: 'uint8',
      data: _.inflate(_.shortString, 'uint16')
    });
    print(_.stringify(_schema))
    assert.equal(printValue, "object({type:'uint8',data:parse('zlib.deflateSync','zlib.inflateSync',string('uint8'),'uint16')})"); printValue = undefined;
    var buffer = _.pack(_schema, {
      type: 2,
      data: '你好世界！Hello'
    });
    print(buffer.join(' '));
    assert.equal(printValue, "2 30 0 120 156 19 121 178 119 193 211 165 123 159 236 152 246 124 106 207 251 61 141 30 169 57 57 249 0 152 20 12 247"); printValue = undefined;
    print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(printValue, "{\"type\":2,\"data\":\"你好世界！Hello\"}"); printValue = undefined;
    print(_.stringify(_.inflate(_.longString)));
    assert.equal(printValue, "inflate(string('uint32'))"); printValue = undefined;
  });
});
