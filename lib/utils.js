var config = require('./config');
var prettyPrint = require('html').prettyPrint;

var _jsdom;
function jsodm() {
    if (_jsdom === undefined) {
        try  {
            _jsdom = require('jsdom');
        } catch (e) {
            _jsdom = require('jsdom-little');
        }
    }
    return _jsdom;
}

function quote(str) {
    return "'" + exports.escape(str).replace(/'/gm, "\\'") + "'";
}
exports.quote = quote;

function escape(str) {
    return str.replace(/\n/gm, '\\n').replace(/\r/gm, '\\r').replace(/\t/gm, '\\t').replace(/\u2028/gm, '\u2028').replace(/\u2029/gm, '\u2029');
}
exports.escape = escape;

function createDocument(doctype) {
    return jsodm().jsdom(config.doctypes[doctype] || doctype || config.doctypes['default']);
}
exports.createDocument = createDocument;

function parse(html) {
    return jsodm().jsdom(html);
}
exports.parse = parse;

function serialize(document, pretty) {
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
exports.serialize = serialize;
