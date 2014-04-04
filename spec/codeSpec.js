var fs = require('fs');
var path = require('path')
var utils = require('../lib/utils');
var xjade = require('../lib/xjade');

var document = utils.createDocument();
var fixture = function(name){ return path.relative(process.cwd(), path.join(__dirname,'fixtures','code',name)); };


describe('Code', function(){

    it('code block {...}', function(){
        var fn = eval(xjade.compile(fixture('codeBlock.js-tpl'), {compile: 'js'}));
        var root = document.createDocumentFragment();
        var result = fn(root);
        expect(result).toEqual("OK");
    });

    it('codeLastElem', function(){
        var fn = eval(xjade.compile(fixture('codeLastElem.js-tpl'), {compile: 'js'}));
        var root = document.createDocumentFragment();
        fn(root);
        expect(root.firstChild.textContent).toEqual('OK');
    });

    it('codeLine', function(){
        var fn = eval(xjade.compile(fixture('codeLine.js-tpl'), {compile: 'js'}));
        var root = document.createDocumentFragment();
        fn(root);
        expect(root.firstChild.textContent).toEqual('OK');
    });
});
