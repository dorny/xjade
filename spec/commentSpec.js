var fs = require('fs');
var path = require('path')
var utils = require('./specUtils');
var xjade = require('../lib/xjade');

var document = utils.createDocument();
var fixture = function(name){ return path.join(__dirname,'fixtures','comment',name+'.js-tpl'); };


describe('Comments', function(){

    it('multiline comment', function(){
        var fn = eval(xjade.compile(fixture('multiline'), {compile: 'js'}));
        var root = document.createDocumentFragment();
        fn(root);
        expect(root.childNodes.length).toEqual(0);
    });

    it('multiline HTML comment', function(){
        var fn = eval(xjade.compile(fixture('multilineHTML'), {compile: 'js'}));
        var root = document.createDocumentFragment();
        fn(root);
        expect(root.childNodes.length).toEqual(1);
        expect(root.firstChild.nodeType).toEqual(8);
    });

    it('singleline comment', function(){
        var fn = eval(xjade.compile(fixture('singleline'), {compile: 'js'}));
        var root = document.createDocumentFragment();
        fn(root);
        expect(root.childNodes.length).toEqual(0);
    });

    it('singleline HTML comment', function(){
        var fn = eval(xjade.compile(fixture('singlelineHTML'), {compile: 'js'}));
        var root = document.createDocumentFragment();
        fn(root);
        expect(root.childNodes.length).toEqual(1);
        expect(root.firstChild.nodeType).toEqual(8);
    });

})
