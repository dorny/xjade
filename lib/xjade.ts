/// <reference path="d.ts/app.d.ts" />

import ASTCompiler = require('./compilers/ast');
import JSCompiler = require('./compilers/javascript');
import HTMLCompiler = require('./compilers/html');
import errors = require('./errors');

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
    compile: 'js',
    doctype: '5',
    data: undefined,
    pretty: false,
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
        try {
            Compiler = require(opts.compile);
            console.log(Compiler);
        } catch (e) {
            throw new Error('Compiler not found: '+opts.compile);
        }
    }

    var compiler = new Compiler(opts);

    var result;
    try {
        result = compiler.compile(filename, opts);
    } catch(e) {

        if (e instanceof errors.CustomError) {
            throw e;
        }
        else {
            throw errors.ICError.wrap(e, filename);
        }
    }

    return result;
}
