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
