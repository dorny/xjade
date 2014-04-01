var fs = require('fs');
var path = require('path');
var utils = require('./specUtils');
var xjade = require('../lib/xjade');

var document = utils.createDocument();
var fixture = function(name){ return path.join(__dirname,'fixtures','text',name); };

describe('Parent Tags', function(){

    it('text node', function(){
        var fn = eval(xjade.compile(fixture('textNode.xjade'), {compile: 'js'}));
        var root = document.createDocumentFragment();
        fn(root);
        var div = root.firstChild;
        expect(root.firstChild.nodeType).toEqual(3);
        expect(root.firstChild.textContent).toEqual('text');
    });

    it('text multiline', function(){
        var fn = eval(xjade.compile(fixture('textMultiLine.xjade'), {compile: 'js'}));
        var root = document.createDocumentFragment();
        fn(root);
        var div = root.firstChild;
        expect(root.firstChild.nodeType).toEqual(3);
        expect(root.firstChild.textContent.replace(/\s+/gm,' ').trim()).toEqual('text multiline');
    });

    it('text code', function(){
        var fn = eval(xjade.compile(fixture('textCode.xjade'), {compile: 'js'}));
        var root = document.createDocumentFragment();
        fn(root,'text');
        var div = root.firstChild;
        expect(root.firstChild.nodeType).toEqual(3);
        expect(root.firstChild.textContent).toEqual('text');
    });

});
