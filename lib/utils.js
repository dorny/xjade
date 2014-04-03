var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
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

var CustomError = (function () {
    function CustomError(message, error) {
        this.message = message;
        if (error == null)
            this.error = new Error(message);
        else
            this.error = error;
    }
    Object.defineProperty(CustomError.prototype, "stack", {
        get: function () {
            return this.error.stack;
        },
        enumerable: true,
        configurable: true
    });
    return CustomError;
})();
exports.CustomError = CustomError;

var ParserError = (function (_super) {
    __extends(ParserError, _super);
    function ParserError(name, message, filename, line, column, error) {
        _super.call(this, message, error);
        this.name = name;
        this.filename = filename;
        this.line = line;
        this.column = column;
    }
    ParserError.prototype.toString = function () {
        return this.filename + ':' + this.line + ':' + this.column + ': ' + this.name + ': ' + this.message;
    };
    return ParserError;
})(CustomError);
exports.ParserError = ParserError;

var ICError = (function (_super) {
    __extends(ICError, _super);
    function ICError(message, filename, line, column, error) {
        _super.call(this, message, error);
        this.filename = filename;
        this.line = line;
        this.column = column;
    }
    ICError.wrap = function (error, filename) {
        var msg;
        if (error && error.message) {
            msg = error.message;
        } else if (typeof error === 'string') {
            msg = error;
        } else {
            msg = require('util').inspect(error);
        }

        if (!error.stack) {
            error = null;
        }

        return new ICError(msg, filename, null, null, error);
    };

    ICError.prototype.toString = function () {
        var msg = this.filename;

        if (this.line != null)
            msg += ':' + this.line;

        if (this.column != null)
            msg += ':' + this.column;

        msg += ': ' + 'ICE: ' + this.message;

        if (this.stack) {
            msg += '\n\n' + this.stack;
        }

        return msg;
    };
    return ICError;
})(CustomError);
exports.ICError = ICError;
