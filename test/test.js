var assert = require('should');
var jpacks = require('../.');
var util = require('util');

var zlib = require('../schemas-extend/zlib');
zlib(jpacks);

// coverage
describe('fixtures', function () {
  it('jpacks.cases()', function () {
    jpacks.register('Point', {
      x: 'int32',
      y: 'int32'
    });
    jpacks.register('Polar', {
      angle: 'double',
      length: 'int32',
      note: jpacks.shortString
    });
    jpacks.register('CaseType', {
      type: 'uint8',
      data: jpacks.depend('type', jpacks.cases([
        [1, 'Point'],
        [2, 'Polar']
      ]))
    });

    var value1 = {
      type: 1,
      data: {
        x: 1,
        y: 2
      }
    };
    var buffer1 = jpacks.pack('CaseType', value1);
    var value2 = jpacks.unpack('CaseType', buffer1);
    assert.equal(JSON.stringify(value1), JSON.stringify(value2));

    var value3 = {
      type: 2,
      data: {
        angle: Math.PI,
        length: 2,
        note: '极坐标 1'
      }
    };
    var buffer3 = jpacks.pack('CaseType', value3);
    var value4 = jpacks.unpack('CaseType', buffer3);
    assert.equal(JSON.stringify(value4), JSON.stringify(value3));
  });
  it('jpacks.union()', function () {
    jpacks.register('UnionShortString', jpacks.union({
      length: jpacks.uint8,
      content: jpacks.shortString
    }, 256));
    var text = '你好世界！Hello';
    var value1 = {
      length: new Buffer(text).length,
      content: text,
    };
    var buffer1 = jpacks.pack('UnionShortString', value1);
    var value2 = jpacks.unpack('UnionShortString', buffer1);
    assert.equal(JSON.stringify(value1), JSON.stringify(value2));
  });

  it('jpacks.register("Point")', function () {
    jpacks.register('Point', {
      x: 'int32',
      y: 'int32'
    });
    var value1 = {
      x: 101,
      y: -101
    };
    var buffer1 = jpacks.pack('Point', value1);
    var value2 = jpacks.unpack('Point', buffer1);
    assert.equal(JSON.stringify(value1), JSON.stringify(value2));
  });

  it('jpacks.register("User")', function () {
    jpacks.register('User', {
      age: 'uint8',
      token: jpacks.array('byte', 10),
      name: jpacks.shortString,
      note: jpacks.longString,
      contacts: jpacks.shortArray('User')
    });
    var user = {
      age: 6,
      token: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      name: 'ss',
      note: '你好世界！Hello World!',
      contacts: [{
        age: 10,
        token: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        name: 'nn',
        note: '风一样的孩子!The wind of the children!',
        contacts: [{
          age: 12,
          token: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
          name: 'zz',
          note: '圣斗士星矢！Saint Seiya！',
          contacts: []
        }]
      }, {
        age: 8,
        token: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        name: 'cc',
        note: '快乐的小熊！Happy bear！',
        contacts: []
      }]
    };
    var buffer = jpacks.pack('User', user);
    var user2 = jpacks.unpack('User', buffer);
    assert.equal(JSON.stringify(user), JSON.stringify(user2));
  });
});

describe('pack', function () {
  // var binary = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  var data = [
    [
      'uint16', 0x3210, false
    ],
    [
      'uint16', 0xff12, true
    ],
    [{
      width: 'uint16',
      height: 'uint16'
    }, {
      width: 0xff12,
      height: 0x3210
    }],
    [{
      color: 'uint32',
      point: {
        width: 'uint16',
        height: 'uint16'
      }
    }, {
      color: 0x0000ff00,
      point: {
        width: 0xff12,
        height: 0x3210
      }
    }]
  ];

  data.forEach(function (item) {
    var type = item[0];
    var value = item[1];
    var options = {
      littleEndian: item[2]
    };
    it(util.format('type: %j, value: %j, options', type, value, options), function () {
      var buffer = jpacks.pack(type, value, options);
      var value2 = jpacks.unpack(type, buffer, options);
      var buffer2 = jpacks.pack(type, jpacks.unpack(type, buffer, options), options);
      assert.equal(Buffer.compare(new Buffer(buffer), new Buffer(buffer2)), 0);
    })
  });
});