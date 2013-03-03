var doxco = require('../index.js');
var fs = require('fs');
var path = require('path');
require('should');

describe('doxco.js', function () {
  it('parse', function () {
    var code = fs.readFileSync(path.join(__dirname, './fixtures/code.js'), 'utf-8');
    var result = doxco.parse({
      description: {
        full: '<p>mock</p>'
      },
      code: code
    });
    console.log(result);
    result.should.have.length(3);
    result[0].description.full.should.be.equal('<p>mock</p>');
    result[0].code.should.be.equal('exports.parse = function (code) {\n  var comments = [];\n  var result;');
    result[1].description.full.should.be.equal("<p>持续解析</p>\n");
    result[1].code.should.be.equal('  while ((result = reg.exec(code)) != null)  {');
    result[2].description.full.should.be.equal("<p>console.log(result);</p>\n");
    result[2].code.should.be.equal('    comments.push({\n      description: {\n        full: markdown(result[0])\n      },\n      code: result.input.substring(result.index)\n    });\n  }\n};\n');
  });
});
