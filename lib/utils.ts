import config = require('./config');

var xmldom = require('xmldom');
var xmldomFixed = false;


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


export function fixXmlDOM(docuement) {
    if (xmldomFixed)
        return;

    var el = docuement.createElement('div');
    var ElementProto = Object.getPrototypeOf(el);

    for (var attrName in config.directAttrs) {
        (function(attrName){
            var propName = config.directAttrs[attrName];
            Object.defineProperty(ElementProto, propName, {
                get: function() { return this.getAttribute(attrName) },
                set: function(value) { this.setAttribute(attrName,value) }
            });

        }(attrName));
    }

    xmldomFixed = true;
}
