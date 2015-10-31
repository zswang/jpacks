module.exports = function defineDependString(Schema) {
  /*<define>*/
  function dependString(field, itemSchema) {
    if (typeof field !== 'string') {
      throw new Error('Parameter "field" must be a string.');
    }

    return new Schema({
      unpack: function _unpack(buffer, options, offsets) {
        if (!options.$scope) {
          throw new Error('Unpack must running in object.');
        }
        var size = options.$scope[field];
        if (typeof size !== 'number') {
          throw new Error('Field "' + field + '" must be a number.');
        }
        return Schema.unpack(Schema.staticString(size, itemSchema), buffer, options, offsets);
      },
      pack: function _pack(value, options, buffer) {
        var size = options.$scope[field];
        if (typeof size !== 'number') {
          throw new Error('Field "' + field + '" must be a number.');
        }
        Schema.pack(Schema.string(size), value, options, buffer);
      },
      name: 'depend string{' + field + '}',
      namespace: 'dependString'
    });
  }
  Schema.register('dependString', dependString);
  /*</define>*/
};