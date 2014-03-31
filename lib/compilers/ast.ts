/// <reference path="../d.ts/app.d.ts" />

var util = require('util');
var parserSource = require('../parser/source');
var parserTemplate = require('../parser/template');

export = CompilerAST;


class CompilerAST implements XJadeCompiler {

    public compile(filename: string, opts: XJadeOptions) : string {

        var template = opts.readFile(filename);
        var ast = parserSource.parse(template);

        ast.forEach((node)=>{
            if (node.type==='Template') {
                try {
                    node.children = parserTemplate.parse(node.body.value);
                    delete node.body;
                } catch (e) {
                    if (e.line===1) {
                        e.offset = e.offset + node.body.offset;
                    }
                    e.line = node.body.line + e.line -1;
                    throw e;
                }
            }
        })

        return util.inspect(ast, {depth: null, colors: true})+'\n';
    }
}
