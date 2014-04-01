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
    currentFile;

    document;
    doctype: string;
    removeDoctype = false;

    public compile(filename: string, opts: XJadeOptions) : string {

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

    }

    private createDocument() {
        var doctype;
        if (this.opts.doctype) {
            doctype = config.doctypes[this.opts.doctype] || this.opts.doctype;
        }
        else {
            doctype = config.doctypes['default'];
        }

        return new xmldom.DOMParser().parseFromString(doctype,'text/xml');
    }

    private processTemplate(filename) {
        var jsCompiler = new JSCompiler();
        var source = 'var exports = {};\n' + jsCompiler.compile(filename, this.opts) + '\n;exports;';

        var prev = this.currentFile;
        this.currentFile = filename;

        var module = vm.runInNewContext(source, {
            require: this.require.bind(this),
            console: console,
            document: this.document,
        }, filename);

        this.modules[filename] = module;
        this.currentFile = prev;

        return <any> module;
    }

    private require(filename) {

        if (path.extname(filename) === '') {
            filename = filename+'.xjade';
        }

        var absolute = path.resolve(this.currentFile, filename);
        var relative = path.relative(process.cwd(), absolute)

        if (fs.existsSync(relative)) {
            return this.processTemplate(relative);
        }
        else {
            return require(filename);
        }
    }

}


