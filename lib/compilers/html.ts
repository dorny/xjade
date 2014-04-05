/// <reference path="../d.ts/app.d.ts" />

import JSCompiler = require('./javascript');
import utils = require('../utils');
import config = require('../config');
import errors = require('../errors');
var RuntimeError = errors.RuntimeError;

var vm = require('vm');
var path = require('path');
var fs = require('fs');


export = CompilerHTML;


class CompilerHTML {

    opts: XJadeOptions;
    root: string;
    modules = {};
    sources = {};
    currentDir;
    document;

    public compile(filename: string, opts: XJadeOptions) : string {

        this.opts = opts;
        this.document = utils.createDocument(opts.doctype);

        this.root = path.dirname(path.resolve(filename));
        var rootModule = this.processTemplate(filename);

        this.run(()=> rootModule.render(this.document, opts.data));

        return utils.serialize(this.document, opts.pretty);
    }

    private processTemplate(filename) {
        var relative = path.relative(process.cwd(), filename);
        var jsCompiler = new JSCompiler();
        var source = jsCompiler.compile(relative, this.opts);
        this.sources[filename] = source;

        var prev = this.currentDir;
        this.currentDir = path.dirname(filename);

        var module = {};
        this.run(()=> {
            vm.runInNewContext(source, {
                require: this.require.bind(this),
                console: console,
                document: this.document,
                exports: module,
            }, filename);
        });

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

    private run(fn) {
        try {
            return fn()
        }
        catch (e) {
            var match;
            if (e.stack  &&  (match= RuntimeError.match(e.stack))!==null  && match.filename!==__filename)
                throw new RuntimeError(e, match.filename, this.sources[match.filename], match.line, match.column);
            else {
                throw new RuntimeError(e);
            }
        }
    }
}


