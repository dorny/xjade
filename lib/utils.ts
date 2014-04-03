/// <reference path="d.ts/app.d.ts" />

import config = require('./config');
var prettyPrint = require('html').prettyPrint;

var _jsdom;
function jsodm() {
    if (_jsdom===undefined) {
        try {
            _jsdom = require('jsdom');
        } catch (e) {
            _jsdom = require('jsdom-little');
        }
    }
    return _jsdom;
}

export function quote(str: string) {
    return "'" +escape(str).replace(/'/gm, "\\'") + "'";
}

export function escape(str: string) {
    return str.replace(/\n/gm,'\\n')
        .replace(/\r/gm,'\\r')
        .replace(/\t/gm,'\\t')
        .replace(/\u2028/gm,'\u2028')
        .replace(/\u2029/gm,'\u2029');
}


export function createDocument(doctype) {
    return jsodm().jsdom(config.doctypes[doctype] || doctype || config.doctypes['default']);
}

export function parse(html) {
    return jsodm().jsdom(html);
}

export function serialize(document, pretty) {
    var output = '';

    if (document.doctype) {
        output += document.doctype.toString();
    }

    output += document.outerHTML;

    if (pretty) {
        output = prettyPrint(output) + '\n';
    }

    return output;
}


export class CustomError {

    public message: string
    public error;

    constructor(message: string, error?) {
        this.message = message;
        if (error==null)
            this.error = new Error(message);
        else
            this.error = error;
    }

    public get stack() {
        return this.error.stack;
    }
}


export class ParserError extends CustomError {

    public filename: string;
    public name: string;
    public line: number;
    public column: number;

    constructor(name: string, message: string, filename: string, line: number, column: number, error?) {
        super(message,error);
        this.name = name;
        this.filename = filename;
        this.line = line;
        this.column = column;
    }

    public toString() {
         return  this.filename+':'+this.line+':'+this.column+': '+this.name+': '+this.message;
    }
}


export class ICError extends CustomError {

    public filename: string;
    public line: number;
    public column: number;

    constructor(message: string, filename: string, line?: number, column?: number, error?) {
        super(message, error);
        this.filename = filename;
        this.line = line;
        this.column = column;
    }

    static wrap(error, filename) {
        var msg;
        if (error && error.message) {
            msg = error.message;
        }
        else if (typeof error==='string') {
            msg = error;
        }
        else {
            msg = require('util').inspect(error);
        }

        if (!error.stack) {
            error = null;
        }

        return new ICError(msg, filename, null, null, error);
    }

    public toString() {
        var msg = this.filename;

        if (this.line != null)
            msg+=':'+this.line;

        if  (this.column !=null)
            msg+=':'+this.column

        msg+=': '+'ICE: '+this.message;

        if (this.stack) {
            msg+='\n\n'+ this.stack;
        }

        return msg;
    }
}
