var assert = require('should');
var jpacks = require('../.');
var util = require('util');

require('.././schemas-extend/bigint')(jpacks);
require('.././schemas-extend/protobuf')(jpacks);
require('.././schemas-extend/zlib')(jpacks);

jpacks.setDefaultOptions({
  browser: true
});