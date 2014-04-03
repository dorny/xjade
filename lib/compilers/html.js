var JSCompiler = require('./javascript');
var utils = require('../utils');

var vm = require('vm');
var path = require('path');
var fs = require('fs');


var CompilerHTML = (function () {
    function CompilerHTML() {
        this.modules = {};
    }
    CompilerHTML.prototype.compile = function (filename, opts) {
        this.opts = opts;
        this.document = utils.createDocument(opts.doctype);

        this.root = path.dirname(path.resolve(filename));
        var rootModule = this.processTemplate(filename);
        rootModule.render(this.document, opts.locals);

        return utils.serialize(this.document, opts.pretty);
    };

    CompilerHTML.prototype.processTemplate = function (filename) {
        var relative = path.relative(process.cwd(), filename);
        var jsCompiler = new JSCompiler();
        var source = 'var exports = {};\n' + jsCompiler.compile(relative, this.opts) + '\n;exports;';

        var prev = this.currentDir;
        this.currentDir = path.dirname(filename);

        var module = vm.runInNewContext(source, {
            require: this.require.bind(this),
            console: console,
            document: this.document
        }, filename);

        this.modules[filename] = module;
        this.currentDir = prev;

        return module;
    };

    CompilerHTML.prototype.require = function (filename) {
        var ext = path.extname(filename);
        if (ext === '.js-tpl' || ext === '.ts-tpl') {
            var absolute = path.resolve(this.currentDir, filename);
            return this.processTemplate(absolute);
        } else {
            return require(filename);
        }
    };
    return CompilerHTML;
})();
module.exports = CompilerHTML;
