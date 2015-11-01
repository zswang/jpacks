module.exports = function (Schema) {
  /*<define>*/
  function bytes(count) {
    return Schema.array('uint8', count);
  }
  Schema.register('bytes', bytes);
  /*</define>*/
};