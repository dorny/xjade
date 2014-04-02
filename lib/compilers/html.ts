/// <reference path="../d.ts/app.d.ts" />

import JSCompiler = require('./javascript');
import utils = require('../utils');
import config = require('../config');

var vm = require('vm');
var xmldom = require('xmldom');
var path = require('path');
var fs = require('fs');
var prettyPrint = require('html').prettyPrint;

export = CompilerHTML;


class CompilerHTML {

    opts: XJadeOptions;
    root: string;
    modules = {};
    currentDir;

    document;
    doctype: string;

    public compile(filename: string, opts: XJadeOptions) : string {

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
    }

    private createDocument() {
        var doctype;
        if (this.opts.doctype != undefined) {
            doctype = config.doctypes[this.opts.doctype] || this.opts.doctype;
        }
        else {
            doctype = config.doctypes['default'];
        }

        var impl = new xmldom.DOMImplementation();
        var doc = impl.createDocument(null,null,null);
        utils.fixXmlDOM(doc);
        doc.doctype = doctype;
        return doc;
    }

    private processTemplate(filename) {
        var relative = path.relative(process.cwd(), filename);
        var jsCompiler = new JSCompiler();
        var source = 'var exports = {};\n' + jsCompiler.compile(relative, this.opts) + '\n;exports;';

        var prev = this.currentDir;
        this.currentDir = path.dirname(filename);

        var module = vm.runInNewContext(source, {
            require: this.require.bind(this),
            console: console,
            document: this.document,
        }, filename);

        this.modules[filename] = module;
        this.currentDir = prev;

        return <any> module;
    }

    private require(filename) {
        var ext = path.extname(filename);
        if (ext==='.js-tpl' || ext==='.ts-tpl') {
            var absolute = path.resolve(this.currentDir, filename);
            return this.processTemplate(absolute);
        }
        else {
            return require(filename);
        }
    }

}


