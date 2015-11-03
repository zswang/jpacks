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
  <!~jdists import="#{item}?example*" /~>
!#{'});'}
});
/*</jdists>*/

<!--jdists export="#pattern">/^\s*\*\s*@example\s*(.*)$/mg</jdists-->
<!--jdists export="#replacement">  it("$1", function () {</jdists-->
<!--jdists encoding="regex" import="#example" pattern="#pattern" replacement="#replacement" export="#example" /-->

<!--jdists export="#pattern">/^\s*```js\s*$/mg</jdists-->
<!--jdists export="#replacement"></jdists-->
<!--jdists encoding="regex" import="#example" pattern="#pattern" replacement="#replacement" export="#example" /-->

<!--jdists export="#pattern">/^\s*```\s*$/mg</jdists-->
<!--jdists export="#replacement">  });</jdists-->
<!--jdists encoding="regex" import="#example" pattern="#pattern" replacement="#replacement" export="#example" /-->

<!--jdists export="#pattern">/console\.log/g</jdists-->
<!--jdists export="#replacement">print</jdists-->
<!--jdists encoding="regex" import="#example" pattern="#pattern" replacement="#replacement" export="#example" /-->

<!--jdists export="#pattern">/\/\/ -?>\s*(.*)/gm</jdists-->
<!--jdists export="#replacement">assert.equal(printValue, '$1'); printValue = undefined;</jdists-->
<!--jdists encoding="regex" import="#example" pattern="#pattern" replacement="#replacement" export="#example" /-->
/*<jdists import="#example"/>*/
