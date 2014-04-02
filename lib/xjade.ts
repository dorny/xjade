/// <reference path="d.ts/node.d.ts" />
/// <reference path="d.ts/app.d.ts" />

import ASTCompiler = require('./compilers/ast');
import JSCompiler = require('./compilers/javascript');
import HTMLCompiler = require('./compilers/html');

var packageVersion = require("../package.json").version;
var fs = require('fs');
var util = require('util');
var path = require('path');

export var version: string = packageVersion;


var compilers = {
    ast: ASTCompiler,
    html: HTMLCompiler,
    js: JSCompiler,
};


export var defaults : XJadeOptions = {
    compile: 'html',
    doctype: '5',
    locals: {},
    debug: false,
    pretty:false,
    readFile: (filename)=> fs.readFileSync(filename).toString()
}


export function compile(filename: string, opts: XJadeOptions = {}) : string {

    for (var key in defaults) {
        if (opts[key] === undefined)
            opts[key] = defaults[key]
    }

    var Compiler;
    if (opts.compile in compilers) {
        Compiler = compilers[opts.compile];
    }
    else {
        Compiler = require(opts.compile);
    }

    var compiler = new Compiler(opts);

    var result;
    try {
        result = compiler.compile(filename, opts);
    } catch(e) {
        var msg = e.filename || filename;

        if ('line' in e)
            msg += ':'+e.line;

        if ('column' in e)
            msg += ':'+e.column;

        msg += ': '+e.message;
        throw new Error(msg);
    }

    return result;
}
