module.exports = function (Schema) {
  /*<define>*/
  /**
   * 字节数组
   *
   * @param {string|Schema|number=} count 下标类型或个数
   * @return {Schema|Function} 返回数据结构
   '''<example>'''
   * @example bytes()
    ```js
    var _ = jpacks;
    var _schema = jpacks.bytes(6);
    console.log(String(_schema));
    // > array('uint8',6)

    var value = [0, 1, 2, 3, 4, 5];
    var buffer = jpacks.pack(_schema, value);
    console.log(buffer.join(' '));
    // > 0 1 2 3 4 5

    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > [0,1,2,3,4,5]
    ```
   * @example bytes() auto size
    ```js
    var _ = jpacks;
    var _schema = jpacks.bytes(null);
    console.log(String(_schema));
    // > array('uint8',null)

    var value = [0, 1, 2, 3, 4, 5];
    var buffer = jpacks.pack(_schema, value);
    console.log(buffer.join(' '));
    // > 0 1 2 3 4 5

    console.log(JSON.stringify(_.unpack(_schema, buffer)));
    // > [0,1,2,3,4,5]
    ```
    '''</example>'''
   */
  function bytes(count) {
    return Schema.array('uint8', count);
  }
  Schema.register('bytes', bytes);
  /*</define>*/
};