/// <reference path="../d.ts/app.d.ts" />

import JSCompiler = require('./javascript');
import utils = require('../utils');
import config = require('../config');

var vm = require('vm');
var path = require('path');
var fs = require('fs');


export = CompilerHTML;


class CompilerHTML {

    opts: XJadeOptions;
    root: string;
    modules = {};
    currentDir;
    document;

    public compile(filename: string, opts: XJadeOptions) : string {

        this.opts = opts;
        this.document = utils.createDocument(opts.doctype);

        this.root = path.dirname(path.resolve(filename));
        var rootModule = this.processTemplate(filename);
        rootModule.render(this.document);

        return utils.serialize(this.document, opts.pretty);
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


