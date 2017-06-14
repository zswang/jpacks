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

describe("src/schemas/array.js", function () {
  var assert = require('should');
  var util = require('util');
  var examplejs_printLines;
  function examplejs_print() {
    examplejs_printLines.push(util.format.apply(util, arguments));
  }
  
  

  it("arrayCreator():static array", function () {
    examplejs_printLines = [];
    var _ = jpacks;
    var _schema = jpacks.array('int16', 2);
    examplejs_print(String(_schema));
    assert.equal(examplejs_printLines.join("\n"), "array('int16',2)"); examplejs_printLines = [];

    var value = [12337, 12851];
    var buffer = jpacks.pack(_schema, value);
    examplejs_print(buffer.join(' '));
    assert.equal(examplejs_printLines.join("\n"), "49 48 51 50"); examplejs_printLines = [];

    examplejs_print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(examplejs_printLines.join("\n"), "[12337,12851]"); examplejs_printLines = [];
  });
          
  it("arrayCreator():dynamic array", function () {
    examplejs_printLines = [];
    var _ = jpacks;
    var _schema = jpacks.array('int16', 'int8');
    examplejs_print(String(_schema));
    assert.equal(examplejs_printLines.join("\n"), "array('int16','int8')"); examplejs_printLines = [];

    var value = [12337, 12851];
    var buffer = jpacks.pack(_schema, value);
    examplejs_print(buffer.join(' '));
    assert.equal(examplejs_printLines.join("\n"), "2 49 48 51 50"); examplejs_printLines = [];

    examplejs_print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(examplejs_printLines.join("\n"), "[12337,12851]"); examplejs_printLines = [];
  });
          
  it("arrayCreator():dynamic array 2", function () {
    examplejs_printLines = [];
    var _ = jpacks;
    var _schema = jpacks.array('int16')(6);
    examplejs_print(String(_schema));
    assert.equal(examplejs_printLines.join("\n"), "array('int16',6)"); examplejs_printLines = [];

    var value = [12337, 12851];
    var buffer = jpacks.pack(_schema, value);
    examplejs_print(buffer.join(' '));
    assert.equal(examplejs_printLines.join("\n"), "49 48 51 50 0 0 0 0 0 0 0 0"); examplejs_printLines = [];

    examplejs_print(JSON.stringify(jpacks.unpack(_schema, buffer)));
    assert.equal(examplejs_printLines.join("\n"), "[12337,12851,0,0,0,0]"); examplejs_printLines = [];
  });
          
  it("arrayCreator():auto size int8", function () {
    examplejs_printLines = [];
    var _ = jpacks;
    var _schema = _.array('int8', null);
    examplejs_print(_.stringify(_schema))
    assert.equal(examplejs_printLines.join("\n"), "array('int8',null)"); examplejs_printLines = [];

    var buffer = _.pack(_schema, [0, 1, 2, 3, 4, 5, 6, 7]);

    examplejs_print(buffer.join(' '));
    assert.equal(examplejs_printLines.join("\n"), "0 1 2 3 4 5 6 7"); examplejs_printLines = [];

    examplejs_print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(examplejs_printLines.join("\n"), "[0,1,2,3,4,5,6,7]"); examplejs_printLines = [];
  });
          
  it("arrayCreator():auto size int16 littleEndian = true", function () {
    examplejs_printLines = [];
    var _ = jpacks;
    var _schema = _.array('int16', null);
    var options = {
      littleEndian: true
    };
    examplejs_print(_.stringify(_schema))
    assert.equal(examplejs_printLines.join("\n"), "array('int16',null)"); examplejs_printLines = [];

    var buffer = _.pack(_schema, [0, 1, 2, 3, 4, 5, 6, 7], options);

    examplejs_print(buffer.join(' '));
    assert.equal(examplejs_printLines.join("\n"), "0 0 1 0 2 0 3 0 4 0 5 0 6 0 7 0"); examplejs_printLines = [];

    examplejs_print(JSON.stringify(_.unpack(_schema, buffer, options)));
    assert.equal(examplejs_printLines.join("\n"), "[0,1,2,3,4,5,6,7]"); examplejs_printLines = [];
  });
          
  it("arrayCreator():auto size int16 littleEndian = false", function () {
    examplejs_printLines = [];
    var _ = jpacks;
    var _schema = _.array('int16', null);
    var options = {
      littleEndian: false
    };
    examplejs_print(_.stringify(_schema))
    assert.equal(examplejs_printLines.join("\n"), "array('int16',null)"); examplejs_printLines = [];

    var buffer = _.pack(_schema, [0, 1, 2, 3, 4, 5, 6, 7], options);

    examplejs_print(buffer.join(' '));
    assert.equal(examplejs_printLines.join("\n"), "0 0 0 1 0 2 0 3 0 4 0 5 0 6 0 7"); examplejs_printLines = [];

    examplejs_print(JSON.stringify(_.unpack(_schema, buffer, options)));
    assert.equal(examplejs_printLines.join("\n"), "[0,1,2,3,4,5,6,7]"); examplejs_printLines = [];
  });
          
  it("arrayCreator():size fault tolerant", function () {
    examplejs_printLines = [];
    var _ = jpacks;
    var _schema = _.array('int8', 4);
    examplejs_print(_.stringify(_schema))
    assert.equal(examplejs_printLines.join("\n"), "array('int8',4)"); examplejs_printLines = [];

    var buffer = _.pack(_schema, [0, 1, 2, 3, 4, 5, 6, 7]);

    examplejs_print(buffer.join(' '));
    assert.equal(examplejs_printLines.join("\n"), "0 1 2 3"); examplejs_printLines = [];

    examplejs_print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(examplejs_printLines.join("\n"), "[0,1,2,3]"); examplejs_printLines = [];

    var buffer = _.pack(_schema, [0, 1, 2]);

    examplejs_print(buffer.join(' '));
    assert.equal(examplejs_printLines.join("\n"), "0 1 2 0"); examplejs_printLines = [];

    examplejs_print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(examplejs_printLines.join("\n"), "[0,1,2,0]"); examplejs_printLines = [];
  });
          
  it("arrayCreator():defaultOptions & littleEndian", function () {
    examplejs_printLines = [];
    var _ = jpacks;
    var _schema = _.array('int16', 7);
    _schema.defaultOptions = {
      littleEndian: false
    };
    var buffer = _.pack(_schema, [1, 2, 3, 4, 5, 6, 7]);
    examplejs_print(buffer.join(' '));
    assert.equal(examplejs_printLines.join("\n"), "0 1 0 2 0 3 0 4 0 5 0 6 0 7"); examplejs_printLines = [];

    _schema.defaultOptions = {
      littleEndian: true
    };
    var buffer = _.pack(_schema, [1, 2, 3, 4, 5, 6, 7]);
    examplejs_print(buffer.join(' '));
    assert.equal(examplejs_printLines.join("\n"), "1 0 2 0 3 0 4 0 5 0 6 0 7 0"); examplejs_printLines = [];
  });
          
});
         

describe("src/schemas/bytes.js", function () {
  var assert = require('should');
  var util = require('util');
  var examplejs_printLines;
  function examplejs_print() {
    examplejs_printLines.push(util.format.apply(util, arguments));
  }
  
  

  it("bytes()", function () {
    examplejs_printLines = [];
    var _ = jpacks;
    var _schema = jpacks.bytes(6);
    examplejs_print(String(_schema));
    assert.equal(examplejs_printLines.join("\n"), "array('uint8',6)"); examplejs_printLines = [];

    var value = [0, 1, 2, 3, 4, 5];
    var buffer = jpacks.pack(_schema, value);
    examplejs_print(buffer.join(' '));
    assert.equal(examplejs_printLines.join("\n"), "0 1 2 3 4 5"); examplejs_printLines = [];

    examplejs_print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(examplejs_printLines.join("\n"), "[0,1,2,3,4,5]"); examplejs_printLines = [];
  });
          
  it("bytes() auto size", function () {
    examplejs_printLines = [];
    var _ = jpacks;
    var _schema = jpacks.bytes(null);
    examplejs_print(String(_schema));
    assert.equal(examplejs_printLines.join("\n"), "array('uint8',null)"); examplejs_printLines = [];

    var value = [0, 1, 2, 3, 4, 5];
    var buffer = jpacks.pack(_schema, value);
    examplejs_print(buffer.join(' '));
    assert.equal(examplejs_printLines.join("\n"), "0 1 2 3 4 5"); examplejs_printLines = [];

    examplejs_print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(examplejs_printLines.join("\n"), "[0,1,2,3,4,5]"); examplejs_printLines = [];
  });
          
});
         

describe("src/schemas/cstring.js", function () {
  var assert = require('should');
  var util = require('util');
  var examplejs_printLines;
  function examplejs_print() {
    examplejs_printLines.push(util.format.apply(util, arguments));
  }
  
  

  it("cstringCreator():base", function () {
    examplejs_printLines = [];
    var _ = jpacks;
    var _schema = _.cstring(32);
    examplejs_print(_.stringify(_schema));
    assert.equal(examplejs_printLines.join("\n"), "cstring(32)"); examplejs_printLines = [];

    var buffer = _.pack(_schema, 'Hello 你好！');
    examplejs_print(buffer.join(' '));
    assert.equal(examplejs_printLines.join("\n"), "72 101 108 108 111 32 228 189 160 229 165 189 239 188 129 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0"); examplejs_printLines = [];

    examplejs_print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(examplejs_printLines.join("\n"), "\"Hello 你好！\""); examplejs_printLines = [];
  });
          
  it("cstringCreator():auto size", function () {
    examplejs_printLines = [];
    var _ = jpacks;
    var _schema = _.cstring(null);
    examplejs_print(_.stringify(_schema));
    assert.equal(examplejs_printLines.join("\n"), "cstring(null)"); examplejs_printLines = [];

    var buffer = _.pack(_schema, 'Hello 你好！');
    examplejs_print(buffer.join(' '));
    assert.equal(examplejs_printLines.join("\n"), "72 101 108 108 111 32 228 189 160 229 165 189 239 188 129 0"); examplejs_printLines = [];

    examplejs_print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(examplejs_printLines.join("\n"), "\"Hello 你好！\""); examplejs_printLines = [];
  });
          
  it("cstringCreator():pchar", function () {
    examplejs_printLines = [];
    var _ = jpacks;
    var _schema = _.array(_.pchar, 'uint8');
    examplejs_print(_.stringify(_schema));
    assert.equal(examplejs_printLines.join("\n"), "array(cstring(null),'uint8')"); examplejs_printLines = [];

    var buffer = _.pack(_schema, ['abc', 'defghijk', 'g']);
    examplejs_print(buffer.join(' '));
    assert.equal(examplejs_printLines.join("\n"), "3 97 98 99 0 100 101 102 103 104 105 106 107 0 103 0"); examplejs_printLines = [];

    examplejs_print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(examplejs_printLines.join("\n"), "[\"abc\",\"defghijk\",\"g\"]"); examplejs_printLines = [];
  });
          
});
         

describe("src/schemas/depend.js", function () {
  var assert = require('should');
  var util = require('util');
  var examplejs_printLines;
  function examplejs_print() {
    examplejs_printLines.push(util.format.apply(util, arguments));
  }
  
  

  it("dependCreator():base", function () {
    examplejs_printLines = [];
    var _ = jpacks;
    var _schema = _.object({
      length1: 'int8',
      length2: 'int8',
      data1: _.depend('length1', _.bytes),
      data2: _.depend('length2', _.array(_.shortString))
    });
    examplejs_print(_.stringify(_schema));
    assert.equal(examplejs_printLines.join("\n"), "object({length1:'int8',length2:'int8',data1:depend('length1','bytes'),data2:depend('length2',array(string('uint8')))})"); examplejs_printLines = [];

    var buffer = _.pack(_schema, {
      length1: 2,
      length2: 3,
      data1: [1, 2],
      data2: ['甲', '乙', '丙']
    });
    examplejs_print(buffer.join(' '));
    assert.equal(examplejs_printLines.join("\n"), "2 3 1 2 3 231 148 178 3 228 185 153 3 228 184 153"); examplejs_printLines = [];

    examplejs_print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(examplejs_printLines.join("\n"), "{\"length1\":2,\"length2\":3,\"data1\":[1,2],\"data2\":[\"甲\",\"乙\",\"丙\"]}"); examplejs_printLines = [];
  });
          
});
         

describe("src/schemas/enums.js", function () {
  var assert = require('should');
  var util = require('util');
  var examplejs_printLines;
  function examplejs_print() {
    examplejs_printLines.push(util.format.apply(util, arguments));
  }
  
  

  it("enumsCreator():map is array", function () {
    examplejs_printLines = [];
    var _ = jpacks;
    var _schema = _.enums(['Sun', 'Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat'], 'uint8');
    examplejs_print(_.stringify(_schema));
    assert.equal(examplejs_printLines.join("\n"), "enums({Sun:0,Mon:1,Tues:2,Wed:3,Thur:4,Fri:5,Sat:6},'uint8')"); examplejs_printLines = [];

    var buffer = _.pack(_schema, 'Tues');
    examplejs_print(buffer.join(' '));
    assert.equal(examplejs_printLines.join("\n"), "2"); examplejs_printLines = [];

    examplejs_print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(examplejs_printLines.join("\n"), "\"Tues\""); examplejs_printLines = [];
  });
          
  it("enumsCreator():map is object", function () {
    examplejs_printLines = [];
    var _ = jpacks;
    var _schema = _.enums({
      Unknown: -1,
      Continue: 100,
      Processing: 100,
      OK: 200,
      Created: 201,
      NotFound: 404
    }, 'int8');
    examplejs_print(_.stringify(_schema));
    assert.equal(examplejs_printLines.join("\n"), "enums({Unknown:-1,Continue:100,Processing:100,OK:200,Created:201,NotFound:404},'int8')"); examplejs_printLines = [];

    var buffer = _.pack(_schema, 'Unknown');
    examplejs_print(buffer.join(' '));
    assert.equal(examplejs_printLines.join("\n"), "255"); examplejs_printLines = [];

    examplejs_print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(examplejs_printLines.join("\n"), "\"Unknown\""); examplejs_printLines = [];
  });
          
  it("enumsCreator():fault tolerant", function () {
    examplejs_printLines = [];
    var _ = jpacks;
    var _schema = _.enums({
      Unknown: -1,
      Continue: 100,
      Processing: 100,
      OK: 200,
      Created: 201,
      NotFound: 404
    }, 'int8');
    examplejs_print(_.stringify(_schema));
    assert.equal(examplejs_printLines.join("\n"), "enums({Unknown:-1,Continue:100,Processing:100,OK:200,Created:201,NotFound:404},'int8')"); examplejs_printLines = [];

    var buffer = _.pack(_schema, 2);
    examplejs_print(buffer.join(' '));
    assert.equal(examplejs_printLines.join("\n"), "2"); examplejs_printLines = [];

    examplejs_print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(examplejs_printLines.join("\n"), "2"); examplejs_printLines = [];
  });
          
});
         

describe("src/schemas/exit.js", function () {
  var assert = require('should');
  var util = require('util');
  var examplejs_printLines;
  function examplejs_print() {
    examplejs_printLines.push(util.format.apply(util, arguments));
  }
  
  

  it("exitCreator():base", function () {
    examplejs_printLines = [];
    var _ = jpacks;
    var _schema = _.object({
      a: _.int8,
      b: _.int8,
      c: _.exit(),
      d: _.int8,
      e: _.int8
    });
    examplejs_print(_.stringify(_schema));
    assert.equal(examplejs_printLines.join("\n"), "object({a:'int8',b:'int8',c:exit(),d:'int8',e:'int8'})"); examplejs_printLines = [];

    var buffer = _.pack(_schema, {
      a: 1,
      b: 2,
      c: 3,
      d: 4,
      e: 5
    });
    examplejs_print(buffer.join(' '));
    assert.equal(examplejs_printLines.join("\n"), "1 2"); examplejs_printLines = [];

    examplejs_print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(examplejs_printLines.join("\n"), "{\"a\":1,\"b\":2,\"c\":null,\"d\":null,\"e\":null}"); examplejs_printLines = [];
  });
          
  it("exitCreator():depend", function () {
    examplejs_printLines = [];
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
    examplejs_print(_.stringify(_schema));
    assert.equal(examplejs_printLines.join("\n"), "object({f1:'A',f2:'A'})"); examplejs_printLines = [];

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
    examplejs_print(buffer.join(' '));
    assert.equal(examplejs_printLines.join("\n"), "1 1 2 0"); examplejs_printLines = [];

    examplejs_print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(examplejs_printLines.join("\n"), "{\"f1\":{\"a\":1,\"b\":1,\"c\":2},\"f2\":{\"a\":0,\"b\":null,\"c\":null}}"); examplejs_printLines = [];
  });
          
});
         

describe("src/schemas/link.js", function () {
  var assert = require('should');
  var util = require('util');
  var examplejs_printLines;
  function examplejs_print() {
    examplejs_printLines.push(util.format.apply(util, arguments));
  }
  
  

  it("linkCreator():base", function () {
    examplejs_printLines = [];
    var _ = jpacks;
    var _schema = {
      size1: 'uint16',
      size2: 'uint16',
      data1: _.link('size1', 'uint8'),
      data2: _.link('size2', 'uint8')
    };
    examplejs_print(_.stringify(_schema));
    assert.equal(examplejs_printLines.join("\n"), "{size1:'uint16',size2:'uint16',data1:link('size1','uint8'),data2:link('size2','uint8')}"); examplejs_printLines = [];

    var buffer = jpacks.pack(_schema, {
      data1: [1, 2, 3, 4],
      data2: [1, 2, 3, 4, 5, 6, 7, 8],
    });
    examplejs_print(buffer.join(' '));
    assert.equal(examplejs_printLines.join("\n"), "4 0 8 0 1 2 3 4 1 2 3 4 5 6 7 8"); examplejs_printLines = [];
    examplejs_print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(examplejs_printLines.join("\n"), "{\"size1\":4,\"size2\":8,\"data1\":[1,2,3,4],\"data2\":[1,2,3,4,5,6,7,8]}"); examplejs_printLines = [];
  });
          
});
         

describe("src/schemas/merge.js", function () {
  var assert = require('should');
  var util = require('util');
  var examplejs_printLines;
  function examplejs_print() {
    examplejs_printLines.push(util.format.apply(util, arguments));
  }
  
  

  it("mergeCreator:base", function () {
    examplejs_printLines = [];
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
    examplejs_print(_.stringify(_schema))
    assert.equal(examplejs_printLines.join("\n"), "object({a:'int8',b:'int8',c:'int8',d:'int8'})"); examplejs_printLines = [];

    var buffer = _.pack(_schema, {
      a: 1,
      b: 2,
      c: 3,
      d: 4
    });

    examplejs_print(buffer.join(' '));
    assert.equal(examplejs_printLines.join("\n"), "1 2 3 4"); examplejs_printLines = [];

    examplejs_print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(examplejs_printLines.join("\n"), "{\"a\":1,\"b\":2,\"c\":3,\"d\":4}"); examplejs_printLines = [];
  });
          
});
         

describe("src/schemas/number.js", function () {
  var assert = require('should');
  var util = require('util');
  var examplejs_printLines;
  function examplejs_print() {
    examplejs_printLines.push(util.format.apply(util, arguments));
  }
  
  

  it("all number", function () {
    examplejs_printLines = [];
    var _ = jpacks;
    var _map = {
      bytes: _.bytes(8)
    };
    'int8,int16,int32,uint8,uint16,uint32,float32,float64,shortint,smallint,longint,byte,word,longword'.split(/,/).forEach(function (item) {
      _map[item] = item;
    });
    var _schema = _.union(_map, 8);
    examplejs_print(_.stringify(_schema));
    assert.equal(examplejs_printLines.join("\n"), "union({bytes:array('uint8',8),int8:'int8',int16:'int16',int32:'int32',uint8:'uint8',uint16:'uint16',uint32:'uint32',float32:'float32',float64:'float64',shortint:'shortint',smallint:'smallint',longint:'longint',byte:'byte',word:'word',longword:'longword'},8)"); examplejs_printLines = [];

    var buffer = _.pack(_schema, {
      bytes: [0x12, 0x23, 0x34, 0x45, 0x56, 0x67, 0x78, 0x89]
    });
    examplejs_print(buffer.join(' '));
    assert.equal(examplejs_printLines.join("\n"), "18 35 52 69 86 103 120 137"); examplejs_printLines = [];

    examplejs_print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(examplejs_printLines.join("\n"), "{\"bytes\":[18,35,52,69,86,103,120,137],\"int8\":18,\"int16\":8978,\"int32\":1161044754,\"uint8\":18,\"uint16\":8978,\"uint32\":1161044754,\"float32\":2882.19189453125,\"float64\":-4.843717058781651e-263,\"shortint\":18,\"smallint\":8978,\"longint\":1161044754,\"byte\":18,\"word\":8978,\"longword\":1161044754}"); examplejs_printLines = [];
  });
          
});
         

describe("src/schemas/object.js", function () {
  var assert = require('should');
  var util = require('util');
  var examplejs_printLines;
  function examplejs_print() {
    examplejs_printLines.push(util.format.apply(util, arguments));
  }
  
  

  it("objectCreator:array", function () {
    examplejs_printLines = [];
    var _ = jpacks;
    var _schema = _.object([_.shortString, _.word]);
    examplejs_print(_.stringify(_schema));
    assert.equal(examplejs_printLines.join("\n"), "object([string('uint8'),'uint16'])"); examplejs_printLines = [];

    var buffer = _.pack(_schema, ['zswang', 1978]);
    examplejs_print(buffer.join(' '));
    assert.equal(examplejs_printLines.join("\n"), "6 122 115 119 97 110 103 186 7"); examplejs_printLines = [];

    examplejs_print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(examplejs_printLines.join("\n"), "[\"zswang\",1978]"); examplejs_printLines = [];
  });
          
  it("objectCreator:object", function () {
    examplejs_printLines = [];
    var _ = jpacks;
    var _schema = _.object({
      name: _.shortString,
      year: _.word
    });
    examplejs_print(_.stringify(_schema));
    assert.equal(examplejs_printLines.join("\n"), "object({name:string('uint8'),year:'uint16'})"); examplejs_printLines = [];

    var buffer = _.pack(_schema, {
        name: 'zswang',
        year: 1978
      });
    examplejs_print(buffer.join(' '));
    assert.equal(examplejs_printLines.join("\n"), "6 122 115 119 97 110 103 186 7"); examplejs_printLines = [];

    examplejs_print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(examplejs_printLines.join("\n"), "{\"name\":\"zswang\",\"year\":1978}"); examplejs_printLines = [];
  });
          
  it("objectCreator:null", function () {
    examplejs_printLines = [];
    var _ = jpacks;
    var _schema = _.object({
      n1: null,
      n2: null,
      s1: _.int8
    });
    examplejs_print(_.stringify(_schema));
    assert.equal(examplejs_printLines.join("\n"), "object({n1:null,n2:null,s1:'int8'})"); examplejs_printLines = [];

    var buffer = _.pack(_schema, {
        n1: 1,
        n2: 2,
        s1: 1
      });
    examplejs_print(buffer.join(' '));
    assert.equal(examplejs_printLines.join("\n"), "1"); examplejs_printLines = [];

    examplejs_print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(examplejs_printLines.join("\n"), "{\"n1\":null,\"n2\":null,\"s1\":1}"); examplejs_printLines = [];
  });
          
});
         

describe("src/schemas/parse.js", function () {
  var assert = require('should');
  var util = require('util');
  var examplejs_printLines;
  function examplejs_print() {
    examplejs_printLines.push(util.format.apply(util, arguments));
  }
  
  

  it("parseCreator():_xor", function () {
    examplejs_printLines = [];
    var _ = jpacks;
    var _xor = function _xor(buffer) {
      return buffer.slice().map(function (item) {
        return item ^ 127;
      });
    };
    var _schema = _.parse(_xor, _xor, 'float64', 8);
    examplejs_print(_.stringify(_schema));
    assert.equal(examplejs_printLines.join("\n"), "parse('_xor','_xor','float64',8)"); examplejs_printLines = [];

    var buffer = _.pack(_schema, 2.94296650666094e+189);
    examplejs_print(buffer.join(' '));
    assert.equal(examplejs_printLines.join("\n"), "111 75 41 7 126 92 58 24"); examplejs_printLines = [];

    examplejs_print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(examplejs_printLines.join("\n"), "2.94296650666094e+189"); examplejs_printLines = [];
  });
          
});
         

describe("src/schemas/string.js", function () {
  var assert = require('should');
  var util = require('util');
  var examplejs_printLines;
  function examplejs_print() {
    examplejs_printLines.push(util.format.apply(util, arguments));
  }
  
  

  it("stringBytes():base", function () {
    examplejs_printLines = [];
    var _ = jpacks;
    var buffer = _.pack(_.bytes(20), _.stringBytes('你好世界！Hello'));

    examplejs_print(buffer.join(' '));
    assert.equal(examplejs_printLines.join("\n"), "228 189 160 229 165 189 228 184 150 231 149 140 239 188 129 72 101 108 108 111"); examplejs_printLines = [];
  });
          
  it("stringBytes():coverage", function () {
    examplejs_printLines = [];
    var _ = jpacks;
    function TextEncoder() {}
    TextEncoder.prototype.encode = function (value) {
      return new Buffer(value);
    };
    global.TextEncoder = TextEncoder;

    var buffer = _.pack(_.bytes(20), _.stringBytes('你好世界！Hello'));

    setTimeout(function () {
      delete global.TextEncoder;
    }, 0);

    examplejs_print(buffer.join(' '));
    assert.equal(examplejs_printLines.join("\n"), "228 189 160 229 165 189 228 184 150 231 149 140 239 188 129 72 101 108 108 111"); examplejs_printLines = [];
  });
          
  it("stringCreator():static", function () {
    examplejs_printLines = [];
    var _ = jpacks;
    var _schema = _.string(25);
    examplejs_print(_.stringify(_schema));
    assert.equal(examplejs_printLines.join("\n"), "string(25)"); examplejs_printLines = [];

    var buffer = _.pack(_schema, '你好世界！Hello');
    examplejs_print(buffer.join(' '));

    assert.equal(examplejs_printLines.join("\n"), "228 189 160 229 165 189 228 184 150 231 149 140 239 188 129 72 101 108 108 111 0 0 0 0 0"); examplejs_printLines = [];
    examplejs_print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(examplejs_printLines.join("\n"), "\"你好世界！Hello\\u0000\\u0000\\u0000\\u0000\\u0000\""); examplejs_printLines = [];
  });
          
  it("stringCreator():dynamic", function () {
    examplejs_printLines = [];
    var _ = jpacks;
    var _schema = _.string('int8');
    examplejs_print(_.stringify(_schema));
    assert.equal(examplejs_printLines.join("\n"), "string('int8')"); examplejs_printLines = [];

    var buffer = _.pack(_schema, '你好世界！Hello');
    examplejs_print(buffer.join(' '));

    assert.equal(examplejs_printLines.join("\n"), "20 228 189 160 229 165 189 228 184 150 231 149 140 239 188 129 72 101 108 108 111"); examplejs_printLines = [];
    examplejs_print(_.unpack(_schema, buffer));
    assert.equal(examplejs_printLines.join("\n"), "你好世界！Hello"); examplejs_printLines = [];
  });
          
  it("stringCreator():coverage", function () {
    examplejs_printLines = [];
    var _ = jpacks;
    _.string();
  });
          
  it("shortString", function () {
    examplejs_printLines = [];
    var _ = jpacks;
    var _schema = _.shortString;
    examplejs_print(_.stringify(_schema));
    assert.equal(examplejs_printLines.join("\n"), "string('uint8')"); examplejs_printLines = [];

    var buffer = _.pack(_schema, 'shortString');
    examplejs_print(buffer.join(' '));

    assert.equal(examplejs_printLines.join("\n"), "11 115 104 111 114 116 83 116 114 105 110 103"); examplejs_printLines = [];
    examplejs_print(_.unpack(_schema, buffer));
    assert.equal(examplejs_printLines.join("\n"), "shortString"); examplejs_printLines = [];
  });
          
  it("smallString", function () {
    examplejs_printLines = [];
    var _ = jpacks;
    var _schema = _.smallString;
    examplejs_print(_.stringify(_schema));
    assert.equal(examplejs_printLines.join("\n"), "string('uint16')"); examplejs_printLines = [];

    var buffer = _.pack(_schema, 'smallString');
    examplejs_print(buffer.join(' '));
    assert.equal(examplejs_printLines.join("\n"), "11 0 115 109 97 108 108 83 116 114 105 110 103"); examplejs_printLines = [];

    examplejs_print(_.unpack(_schema, buffer));
    assert.equal(examplejs_printLines.join("\n"), "smallString"); examplejs_printLines = [];
  });
          
  it("longString", function () {
    examplejs_printLines = [];
    var _ = jpacks;
    var _schema = _.longString;
    examplejs_print(_.stringify(_schema));
    assert.equal(examplejs_printLines.join("\n"), "string('uint32')"); examplejs_printLines = [];

    var buffer = _.pack(_schema, 'longString');
    examplejs_print(buffer.join(' '));
    assert.equal(examplejs_printLines.join("\n"), "10 0 0 0 108 111 110 103 83 116 114 105 110 103"); examplejs_printLines = [];
    examplejs_print(_.unpack(_schema, buffer));
    assert.equal(examplejs_printLines.join("\n"), "longString"); examplejs_printLines = [];
  });
          
});
         

describe("src/schemas/union.js", function () {
  var assert = require('should');
  var util = require('util');
  var examplejs_printLines;
  function examplejs_print() {
    examplejs_printLines.push(util.format.apply(util, arguments));
  }
  
  

  it("unionCreator():base", function () {
    examplejs_printLines = [];
    var _ = jpacks;
    var _schema = _.union({
      length: _.byte,
      content: _.shortString
    }, 20);
    examplejs_print(_.stringify(_schema));
    assert.equal(examplejs_printLines.join("\n"), "union({length:'uint8',content:string('uint8')},20)"); examplejs_printLines = [];

    var buffer = _.pack(_schema, {
      content: '0123456789'
    });
    examplejs_print(buffer.join(' '));
    assert.equal(examplejs_printLines.join("\n"), "10 48 49 50 51 52 53 54 55 56 57 0 0 0 0 0 0 0 0 0"); examplejs_printLines = [];

    examplejs_print(JSON.stringify(_.unpack(_schema, buffer)));
    assert.equal(examplejs_printLines.join("\n"), "{\"length\":10,\"content\":\"0123456789\"}"); examplejs_printLines = [];
  });
          
});
         

describe("src/schemas/virtual.js", function () {
  var assert = require('should');
  var util = require('util');
  var examplejs_printLines;
  function examplejs_print() {
    examplejs_printLines.push(util.format.apply(util, arguments));
  }
  
  

  it("virtualCreator:number", function () {
    examplejs_printLines = [];
    var _ = jpacks;
    var _schema = _.object({
      f1: 'uint16',
      v1: _.depend('f1', _.virtual(-4))
    });
    examplejs_print(_.stringify(_schema))
    assert.equal(examplejs_printLines.join("\n"), "object({f1:'uint16',v1:depend('f1',virtual(-4))})"); examplejs_printLines = [];

    var buffer = _.pack(_schema, {
      f1: 4
    });

    examplejs_print(buffer.join(' '));
    assert.equal(examplejs_printLines.join("\n"), "4 0"); examplejs_printLines = [];

    examplejs_print(JSON.stringify(_.unpack(_schema, buffer, { littleEndian: false })));
    assert.equal(examplejs_printLines.join("\n"), "{\"f1\":1024,\"v1\":1020}"); examplejs_printLines = [];
  });
          
  it("virtualCreator:string", function () {
    examplejs_printLines = [];
    var _ = jpacks;
    var _schema = _.object({
      name: _.shortString,
      welcome: _.depend('name', _.virtual('Hello '))
    });
    examplejs_print(_.stringify(_schema))
    assert.equal(examplejs_printLines.join("\n"), "object({name:string('uint8'),welcome:depend('name',virtual('Hello '))})"); examplejs_printLines = [];

    var buffer = _.pack(_schema, {
      name: 'World!'
    });

    examplejs_print(buffer.join(' '));
    assert.equal(examplejs_printLines.join("\n"), "6 87 111 114 108 100 33"); examplejs_printLines = [];

    examplejs_print(JSON.stringify(_.unpack(_schema, buffer, { littleEndian: false })));
    assert.equal(examplejs_printLines.join("\n"), "{\"name\":\"World!\",\"welcome\":\"Hello World!\"}"); examplejs_printLines = [];
  });
          
  it("virtualCreator:depend", function () {
    examplejs_printLines = [];
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
    examplejs_print(_.stringify(_schema))
    assert.equal(examplejs_printLines.join("\n"), "object({name:string('uint8'),welcome:depend('name',$fn)})"); examplejs_printLines = [];

    var buffer = _.pack(_schema, {
      name: 'zswang'
    });

    examplejs_print(buffer.join(' '));
    assert.equal(examplejs_printLines.join("\n"), "6 122 115 119 97 110 103"); examplejs_printLines = [];

    examplejs_print(JSON.stringify(_.unpack(_schema, buffer, { littleEndian: false })));
    assert.equal(examplejs_printLines.join("\n"), "{\"name\":\"zswang\",\"welcome\":\"Hello zswang\"}"); examplejs_printLines = [];

    var buffer = _.pack(_schema, {
      name: 'wang'
    });

    examplejs_print(buffer.join(' '));
    assert.equal(examplejs_printLines.join("\n"), "4 119 97 110 103"); examplejs_printLines = [];

    examplejs_print(JSON.stringify(_.unpack(_schema, buffer, { littleEndian: false })));
    assert.equal(examplejs_printLines.join("\n"), "{\"name\":\"wang\",\"welcome\":\"Hi wang\"}"); examplejs_printLines = [];
  });
          
});
         