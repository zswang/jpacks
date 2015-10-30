var assert = require('should');
var jpacks = require('../.');
var util = require('util');

// coverage
describe('fixtures', function () {
  it('jpack.register("Point")', function () {
    jpacks.register('Point', {
      x: 'int32',
      y: 'int32'
    });
    var point = {
      x: 101,
      y: -101
    };
    var buffer = jpacks.pack('Point', point);
    var point2 = jpacks.unpack('Point', buffer);
    assert.equal(JSON.stringify(point), JSON.stringify(point2));
  });

  it('jpack.register("User")', function () {
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