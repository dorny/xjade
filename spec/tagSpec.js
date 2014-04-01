var fs = require('fs');
var path = require('path');
var utils = require('./specUtils');
var xjade = require('../lib/xjade');

var document = utils.createDocument();
var fixture = function(name){ return path.join(__dirname,'fixtures','tag',name+'.js-tpl'); };

describe('Tags', function(){

    it('create <div>', function(){
        var fn = eval(xjade.compile(fixture('tagName'), {compile: 'js'}));
        var root = document.createDocumentFragment();
        fn(root);
        expect(root.firstChild.tagName.toUpperCase()).toEqual('DIV');
    });

    it('create div with "#some-id"', function(){
        var fn = eval(xjade.compile(fixture('tagID'), {compile: 'js'}));
        var root = document.createDocumentFragment();
        fn(root);
        expect(root.firstChild.id).toEqual('some-id');
    });

    it('create with classes ".class1 class2"', function(){
        var fn = eval(xjade.compile(fixture('tagClasses'), {compile: 'js'}));
        var root = document.createDocumentFragment();
        fn(root);
        expect(root.firstChild.className).toEqual('class1 class2');
    });

    it('create inline "#{div}"', function(){
        var fn = eval(xjade.compile(fixture('tagInline'), {compile: 'js'}));
        var root = document.createDocumentFragment();
        fn(root);
        expect(root.firstChild.tagName.toUpperCase()).toEqual('DIV');
    });

    it('create direct child "div > span"', function(){
        var fn = eval(xjade.compile(fixture('tagChild'), {compile: 'js'}));
        var root = document.createDocumentFragment();
        fn(root);
        expect(root.firstChild.tagName.toUpperCase()).toEqual('DIV');
        expect(root.firstChild.firstChild.tagName.toUpperCase()).toEqual('SPAN');
    });

    it('create div with attributes', function(){
        var fn = eval(xjade.compile(fixture('tagAttributes'), {compile: 'js'}));
        var root = document.createDocumentFragment();
        fn(root);
        var input = root.firstChild;
        expect(input.id).toEqual('some-id');
        expect(input.className).toEqual('class');
        expect(input.name).toEqual('name');
        expect(input.value).toEqual('value');
        expect(input.getAttribute('data-custom')).toEqual('custom');
    });

    it('create div with attributes assigned js code values', function(){
        var fn = eval(xjade.compile(fixture('tagAttributesValue'), {compile: 'js'}));
        var root = document.createDocumentFragment();
        fn(root, 'id','name');
        var div = root.firstChild;
        expect(div.id).toEqual('id');
        expect(div.getAttribute('data-name')).toEqual('name');
    });
});
