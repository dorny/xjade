var JSCompiler = require('./javascript');
var utils = require('../utils');
var config = require('../config');

var vm = require('vm');
var xmldom = require('xmldom');
var path = require('path');
var fs = require('fs');
var prettyPrint = require('html').prettyPrint;


var CompilerHTML = (function () {
    function CompilerHTML() {
        this.modules = {};
    }
    CompilerHTML.prototype.compile = function (filename, opts) {
        this.opts = opts;
        this.document = this.createDocument();

        this.root = path.dirname(path.resolve(filename));
        var rootModule = this.processTemplate(filename);
        rootModule.render(this.document);

        var output = this.document.doctype;
        output += new xmldom.XMLSerializer().serializeToString(this.document);

        if (this.opts.pretty) {
            output = prettyPrint(output) + '\n';
        }

        return output;
    };

    CompilerHTML.prototype.createDocument = function () {
        var doctype;
        if (this.opts.doctype != undefined) {
            doctype = config.doctypes[this.opts.doctype] || this.opts.doctype;
        } else {
            doctype = config.doctypes['default'];
        }

        var impl = new xmldom.DOMImplementation();
        var doc = impl.createDocument(null, null, null);
        utils.fixXmlDOM(doc);
        doc.doctype = doctype;
        return doc;
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
