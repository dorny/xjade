var ASTCompiler = require('./compilers/ast');
var JSCompiler = require('./compilers/javascript');
var HTMLCompiler = require('./compilers/html');

var packageVersion = require("../package.json").version;
var fs = require('fs');
var util = require('util');
var path = require('path');

exports.version = packageVersion;

var compilers = {
    ast: ASTCompiler,
    html: HTMLCompiler,
    js: JSCompiler
};

exports.defaults = {
    compile: 'html',
    doctype: '5',
    locals: {},
    debug: false,
    pretty: false,
    readFile: function (filename) {
        return fs.readFileSync(filename).toString();
    }
};

function compile(filename, opts) {
    if (typeof opts === "undefined") { opts = {}; }
    for (var key in exports.defaults) {
        if (opts[key] === undefined)
            opts[key] = exports.defaults[key];
    }

    var Compiler;
    if (opts.compile in compilers) {
        Compiler = compilers[opts.compile];
    } else {
        Compiler = require(opts.compile);
    }

    var compiler = new Compiler(opts);

    var result;
    try  {
        result = compiler.compile(filename, opts);
    } catch (e) {
        var msg = e.filename || filename;

        if ('line' in e)
            msg += ':' + e.line;

        if ('column' in e)
            msg += ':' + e.column;

        msg += ': ' + e.message;
        throw new Error(msg);
    }

    return result;
}
exports.compile = compile;
