var fs = require('fs');
var path = require('path')
var utils = require('../lib/utils');
var xjade = require('../lib/xjade');

var document = utils.createDocument();
var fixture = function(name){ return path.relative(process.cwd(), path.join(__dirname,'fixtures','comment',name)); };


describe('Comments', function(){

    it('multiline comment', function(){
        var fn = eval(xjade.compile(fixture('multiline.xjade'), {compile: 'js'}));
        var root = fn(null);
        expect(root.childNodes.length).toEqual(0);
    });

    it('multiline HTML comment', function(){
        var fn = eval(xjade.compile(fixture('multilineHTML.xjade'), {compile: 'js'}));
        var root = fn(null);
        expect(root.childNodes.length).toEqual(1);
        expect(root.firstChild.nodeType).toEqual(8);
    });

    it('singleline comment', function(){
        var fn = eval(xjade.compile(fixture('singleline.xjade'), {compile: 'js'}));
        var root = fn(null);
        expect(root.childNodes.length).toEqual(0);
    });

    it('singleline HTML comment', function(){
        var fn = eval(xjade.compile(fixture('singlelineHTML.xjade'), {compile: 'js'}));
        var root = fn(null);
        expect(root.childNodes.length).toEqual(1);
        expect(root.firstChild.nodeType).toEqual(8);
    });

})
