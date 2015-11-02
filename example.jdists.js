var assert = require('should');
var jpacks = require('../.');
var util = require('util');

var zlib = require('../schemas-extend/zlib');
zlib(jpacks);

var printValue;
function print(value) {
  printValue = value;
}

/*<remove>*/
  // <!--jdists encoding="glob" pattern="./src/**/*.js" export="#files" /-->
/*</remove>*/

/*<jdists encoding="jhtmls,regex" pattern="/~/g" replacement="--" data="#files" export="#example">*/
forEach(function (item) {
!#{'describe("' + item + '", function () {'}
  <!~jdists import="#{item}?example*" /~>
!#{'});'}
});
  <!~jdists import="schemas-extend/zlib.js?example*" /~>
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

<!--jdists export="#pattern">/\/\/ ->\s*(.*)/gm</jdists-->
<!--jdists export="#replacement">assert.equal(printValue, '$1')</jdists-->
<!--jdists encoding="regex" import="#example" pattern="#pattern" replacement="#replacement" export="#example" /-->
/*<jdists import="#example"/>*/
