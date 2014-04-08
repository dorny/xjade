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
    modules = {};
    sources = {};
    document;

    public compile(filename: string, opts: XJadeOptions) : string {

        this.opts = opts;
        this.document = utils.createDocument(opts.doctype);

        filename = path.resolve(filename);
        var rootModule = this.processTemplate(filename);

        this.run(()=> rootModule.render(this.document, opts.data));

        return utils.serialize(this.document, opts.pretty);
    }

    private processTemplate(filename: string) {

        if (this.modules[filename]) {
            return this.modules[filename];
        }

        var relative = path.relative(process.cwd(), filename);
        var jsCompiler = new JSCompiler();
        var source = jsCompiler.compile(relative, this.opts);
        this.sources[filename] = source;

        var module = {};
        this.run(()=> {
            vm.runInNewContext(source, {
                require: this.require.bind(this, path.dirname(filename)),
                console: console,
                document: this.document,
                exports: module,
            }, filename);
        });

        this.modules[filename] = module;

        return <any> module;
    }

    private require(from, filename) {
        var ext = path.extname(filename);
        var absolute = path.resolve(from, filename);

        if (filename[0]!=='.') {
            return require(filename);
        }
        if (ext==='.js' || fs.existsSync(absolute+'.js')) {
            return require(absolute);
        }
        else {

            if (ext!=='.xjade') {
                absolute += '.xjade';
            }

            return this.processTemplate(absolute);
        }
    }

    private run(fn) {
        try {
            return fn()
        }
        catch (e) {
            var match;
            if (e.stack  &&  (match= RuntimeError.match(e.stack))!==null  && match.filename!==__filename) {
                var filename = path.relative(process.cwd(), match.filename);
                throw new RuntimeError(e, filename, this.sources[match.filename], match.line, match.column);
            }
            else {
                throw new RuntimeError(e);
            }
        }
    }
}


