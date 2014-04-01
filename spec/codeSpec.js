var fs = require('fs');
var path = require('path')
var utils = require('./specUtils');
var xjade = require('../lib/xjade');

var document = utils.createDocument();
var fixture = function(name){ return path.join(__dirname,'fixtures','code',name+'.js-tpl'); };


describe('Code', function(){

    it('code block {...}', function(){
        var fn = eval(xjade.compile(fixture('codeBlock'), {compile: 'js'}));
        var root = document.createDocumentFragment();
        var result = fn(root);
        expect(result).toEqual("OK");
    });

    it('codeLastElem', function(){
        var fn = eval(xjade.compile(fixture('codeLastElem'), {compile: 'js'}));
        var root = document.createDocumentFragment();
        fn(root);
        expect(root.firstChild.textContent).toEqual('OK');
    });

    it('codeLine', function(){
        var fn = eval(xjade.compile(fixture('codeLine'), {compile: 'js'}));
        var root = document.createDocumentFragment();
        fn(root);
        expect(root.firstChild.textContent).toEqual('OK');
    });
});
