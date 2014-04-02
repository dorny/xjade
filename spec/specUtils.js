var xmldom = require('xmldom');

exports.createDocument = function() {
    return new xmldom.DOMParser().parseFromString('<!DOCTYPE html>','text/xml');
}

exports.parse = function(html) {
    return new xmldom.DOMParser().parseFromString(html,'text/xml');
}

exports.serialize = function(document) {
    return new xmldom.XMLSerializer().serializeToString(document);
}
