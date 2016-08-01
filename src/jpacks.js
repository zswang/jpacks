(function (exportName) {

  /*<remove>*/
  'use strict';
  /*</remove>*/

  /*<jdists encoding='ejs' data='../package.json'>*/
  /**
   * @file <%- name %>
   *
   * <%- description %>
   * @author
       <% (author instanceof Array ? author : [author]).forEach(function (item) { %>
   *   <%- item.name %> (<%- item.url %>)
       <% }); %>
   * @version <%- version %>
       <% var now = new Date() %>
   * @date <%- [
        now.getFullYear(),
        now.getMonth() + 101,
        now.getDate() + 100
      ].join('-').replace(/-1/g, '-') %>
   */
  /*</jdists>*/

  /*<jdists import="./schema.js?define">*/
  var createSchema = require('./schema');
  /*</jdists>*/

  /**
   * 创建数据结构作用域
   *
   * @return 返回 Schema
   */
  function create() {
    var Schema = createSchema();
    /*<jdists encoding="regex" pattern="/^.*'(.*)'.*$/mg" replacement="<!--jdists import='$1.js?define'/-->">*/
    require('./schemas/number')(Schema);

    require('./schemas/array')(Schema);
    require('./schemas/bytes')(Schema);

    require('./schemas/object')(Schema);
    require('./schemas/union')(Schema);
    require('./schemas/enums')(Schema);

    require('./schemas/string')(Schema);

    require('./schemas/cstring')(Schema);

    require('./schemas/depend')(Schema);
    require('./schemas/exit')(Schema);
    require('./schemas/parse')(Schema);

    require('./schemas/virtual')(Schema);
    require('./schemas/link')(Schema);
    require('./schemas/merge')(Schema);
    /*</jdists>*/

    return Schema;
  }
  var root = create();
  root.create = create;
  var exports = root;
  /* istanbul ignore next */
  if (typeof define === 'function') {
    if (define.amd || define.cmd) {
      define(function () {
        return exports;
      });
    }
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = exports;
  } else {
    window[exportName] = exports;
  }

})('jpacks');