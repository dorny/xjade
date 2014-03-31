var util = require('util');
var parserSource = require('../parser/source');
var parserTemplate = require('../parser/template');


var CompilerAST = (function () {
    function CompilerAST() {
    }
    CompilerAST.prototype.compile = function (filename, opts) {
        var template = opts.readFile(filename);
        var ast = parserSource.parse(template);

        ast.forEach(function (node) {
            if (node.type === 'Template') {
                try  {
                    node.children = parserTemplate.parse(node.body.value);
                    delete node.body;
                } catch (e) {
                    if (e.line === 1) {
                        e.offset = e.offset + node.body.offset;
                    }
                    e.line = node.body.line + e.line - 1;
                    throw e;
                }
            }
        });

        return util.inspect(ast, { depth: null, colors: true }) + '\n';
    };
    return CompilerAST;
})();
module.exports = CompilerAST;
