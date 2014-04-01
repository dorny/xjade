var xmldom = require('xmldom');

exports.createDocument = function() {
    return new xmldom.DOMParser().parseFromString('<!DOCTYPE html>','text/xml');
}

exports.serialize = function(document) {
    new xmldom.XMLSerializer().serializeToString(document);
}
