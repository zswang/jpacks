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

/*<remove>*/
  // <!--jdists encoding="glob" pattern="./src/**/*.js" export="#files" /-->
  // <!--jdists encoding="glob" pattern="./schemas-extend/**/*.js" export="#filesExtend" /-->
/*</remove>*/

/*<jdists encoding="jhtmls" data="#filesExtend">
forEach(function (item) {
  #{"require('../" + item.replace(/\.js$/, '') + "')(jpacks)"};
});
</jdists>*/

/*<jdists encoding="jhtmls,regex" pattern="/~/g" replacement="--" data="#files" export="#example">*/
  /*<jdists encoding="jhtmls" data="#filesExtend">
  forEach(function (item) {
    #{"push('" + item + "');"}
  });
  </jdists>*/
forEach(function (item) {
!#{'describe("' + item + '", function () {'}
  !#{'printValue = undefined;'}
  <!~jdists import="#{item}?example*" /~>
!#{'});'}
});
/*</jdists>*/

/*<jdists export="#replacer">*/
function (content) {
  content = content.replace(/^\s*\*\s*@example\s*(.*)$/mg,
    '  it("$1", function () {');
  content = content.replace(/^\s*```js\s*$/mg, '');
  content = content.replace(/\/\/ -?>\s*(.*)/gm, function (all, output) {
    return 'assert.equal(printValue, ' + JSON.stringify(output) + '); printValue = undefined;'
  });
  content = content.replace(/console\.log/g, 'print');
  content = content.replace(/^\s*```\s*$/mg,
    '  });');
  return content;
}
/*</jdists>*/
/*<jdists encoding="#replacer" import="#example"/>*/
