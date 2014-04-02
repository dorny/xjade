var config = require('./config');

var xmldom = require('xmldom');
var xmldomFixed = false;

function quote(str) {
    return "'" + exports.escape(str).replace(/'/gm, "\\'") + "'";
}
exports.quote = quote;

function escape(str) {
    return str.replace(/\n/gm, '\\n').replace(/\r/gm, '\\r').replace(/\t/gm, '\\t').replace(/\u2028/gm, '\u2028').replace(/\u2029/gm, '\u2029');
}
exports.escape = escape;

function fixXmlDOM(docuement) {
    if (xmldomFixed)
        return;

    var el = docuement.createElement('div');
    var ElementProto = Object.getPrototypeOf(el);

    for (var attrName in config.directAttrs) {
        (function (attrName) {
            var propName = config.directAttrs[attrName];
            Object.defineProperty(ElementProto, propName, {
                get: function () {
                    return this.getAttribute(attrName);
                },
                set: function (value) {
                    this.setAttribute(attrName, value);
                }
            });
        }(attrName));
    }

    xmldomFixed = true;
}
exports.fixXmlDOM = fixXmlDOM;
