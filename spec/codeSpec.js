var fs = require('fs');
var path = require('path')
var utils = require('../lib/utils');
var xjade = require('../lib/xjade');

var document = utils.createDocument();
var fixture = function(name){ return path.relative(process.cwd(), path.join(__dirname,'fixtures','code',name)); };


describe('Code', function(){

    it('should append code block {...}', function(){
        var fn = eval(xjade.compile(fixture('codeBlock.xjade'), {compile: 'js'}));
        var root = document.createDocumentFragment();
        var result = fn(root);
        expect(result).toEqual("OK");
    });

    it('should have set lastly created element', function(){
        var fn = eval(xjade.compile(fixture('codeLastElem.xjade'), {compile: 'js'}));
        var root = document.createDocumentFragment();
        fn(root);
        expect(root.firstChild.textContent).toEqual('OK');
    });

    it('should append condition', function(){
        var fn = eval(xjade.compile(fixture('codeLine.xjade'), {compile: 'js'}));
        var root = document.createDocumentFragment();
        fn(root);
        expect(root.firstChild.textContent).toEqual('OK');
    });
});
