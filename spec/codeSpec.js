var fs = require('fs');
var path = require('path')
var utils = require('../lib/utils');
var xjade = require('../lib/xjade');

var document = utils.createDocument();
var fixture = function(name){ return path.relative(process.cwd(), path.join(__dirname,'fixtures','code',name)); };


describe('Code', function(){

    it('code block {...}', function(){
        var fn = eval(xjade.compile(fixture('codeBlock.xjade'), {compile: 'js'}));
        var result = fn(null);
        expect(result).toEqual("OK");
    });

    it('codeLastElem', function(){
        var fn = eval(xjade.compile(fixture('codeLastElem.xjade'), {compile: 'js'}));
        var root = fn(null);
        expect(root.firstChild.textContent).toEqual('OK');
    });

    it('codeLine', function(){
        var fn = eval(xjade.compile(fixture('codeLine.xjade'), {compile: 'js'}));
        var root = fn(null);
        expect(root.firstChild.textContent).toEqual('OK');
    });
});
