var JSCompiler = require('./javascript');

var config = require('../config');

var vm = require('vm');
var xmldom = require('xmldom');
var path = require('path');
var fs = require('fs');
var prettyPrint = require('html').prettyPrint;


var CompilerHTML = (function () {
    function CompilerHTML() {
        this.modules = {};
        this.removeDoctype = false;
    }
    CompilerHTML.prototype.compile = function (filename, opts) {
        this.opts = opts;
        this.document = this.createDocument();

        this.root = path.dirname(filename);
        var rootModule = this.processTemplate(filename);
        rootModule.render(this.document);

        var output = new xmldom.XMLSerializer().serializeToString(this.document);

        if (this.removeDoctype) {
            output = output.slice(this.doctype.length);
        }

        if (this.opts.pretty) {
            output = prettyPrint(output) + '\n';
        }

        return output;
    };

    CompilerHTML.prototype.createDocument = function () {
        var doctype;
        if (this.opts.doctype) {
            doctype = config.doctypes[this.opts.doctype] || this.opts.doctype;
        } else {
            doctype = config.doctypes['default'];
        }

        return new xmldom.DOMParser().parseFromString(doctype, 'text/xml');
    };

    CompilerHTML.prototype.processTemplate = function (filename) {
        var jsCompiler = new JSCompiler();
        var source = 'var exports = {};\n' + jsCompiler.compile(filename, this.opts) + '\n;exports;';

        var prev = this.currentFile;
        this.currentFile = filename;

        var module = vm.runInNewContext(source, {
            require: this.require.bind(this),
            console: console,
            document: this.document
        }, filename);

        this.modules[filename] = module;
        this.currentFile = prev;

        return module;
    };

    CompilerHTML.prototype.require = function (filename) {
        if (path.extname(filename) === '') {
            filename = filename + '.xjade';
        }

        var absolute = path.resolve(this.currentFile, filename);
        var relative = path.relative(process.cwd(), absolute);

        if (fs.existsSync(relative)) {
            return this.processTemplate(relative);
        } else {
            return require(filename);
        }
    };
    return CompilerHTML;
})();
module.exports = CompilerHTML;
