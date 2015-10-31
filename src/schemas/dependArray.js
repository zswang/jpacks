module.exports = function defineDependArray(Schema) {
  /*<define>*/
  function dependArray(field, itemSchema) {
    if (typeof field !== 'string') {
      throw new Error('Parameter "field" must be a string.');
    }

    return new Schema({
      unpack: function _unpack(buffer, options, offsets) {
        if (!options.$scope) {
          throw new Error('Unpack must running in object.');
        }
        var length = options.$scope[field];
        if (typeof length !== 'number') {
          throw new Error('Field "' + field + '" must be a number.');
        }
        return Schema.unpack(Schema.staticArray(length, itemSchema), buffer, options, offsets);
      },
      pack: function _pack(value, options, buffer) {
        var length = options.$scope[field];
        if (typeof length !== 'number') {
          throw new Error('Field "' + field + '" must be a number.');
        }
        Schema.pack(Schema.array(length, itemSchema), value, options, buffer);
      },
      name: 'depend array{' + field + '}',
      namespace: 'dependArray'
    });
  }
  Schema.register('dependArray', dependArray);
  /*</define>*/
};