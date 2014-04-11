/// <reference path="d.ts/app.d.ts" />

import config = require('./config');
var splitcode = require('./parser/splitcode');
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

export function splitByLine(str: string) {
    return str.split(/[\n\u0085\u2028\u2029]|\r\n?/);
}

export function removeIndent(str: string, indent: number) {
    var re = new RegExp('^\\s{1,'+indent+'}');
    return splitByLine(str).map((ln,i)=> {
        if (i===0)
            return ln;
        else
            return ln.replace(re,'');
    }).join('\n');
}

export function addIndent(str: string, indent, token) {
    var space = '';
    for(var i=0; i<indent; i++) {
        space += token;
    }

    return splitByLine(str).map((ln)=> {
        return space+ln;
    }).join('\n');
}

export function replaceEl(code: string, elName: string) {
    return splitcode.parse(code).map((part)=> {
        if (part.type==='El')
            return elName;
        else
            return part.value;
    }).join('');
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
