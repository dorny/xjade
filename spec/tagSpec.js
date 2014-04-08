var fs = require('fs');
var path = require('path');
var utils = require('../lib/utils');
var xjade = require('../lib/xjade');

var document = utils.createDocument();
var fixture = function(name){ return path.relative(process.cwd(), path.join(__dirname,'fixtures','tag',name)); };


describe('Tags', function(){

    it('create <div>', function(){
        var fn = eval(xjade.compile(fixture('tagName.xjade'), {compile: 'js'}));
        var root = document.createDocumentFragment();
        fn(root);
        expect(root.firstChild.tagName.toUpperCase()).toEqual('DIV');
    });

    it('create div with "#some-id"', function(){
        var fn = eval(xjade.compile(fixture('tagID.xjade'), {compile: 'js'}));
        var root = document.createDocumentFragment();
        fn(root);
        expect(root.firstChild.id).toEqual('some-id');
    });

    it('create with classes ".class1 class2"', function(){
        var fn = eval(xjade.compile(fixture('tagClasses.xjade'), {compile: 'js'}));
        var root = document.createDocumentFragment();
        fn(root);
        expect(root.firstChild.className).toEqual('class1 class2 class3 class4');
    });

    it('create inline "#{div}"', function(){
        var fn = eval(xjade.compile(fixture('tagInline.xjade'), {compile: 'js'}));
        var root = document.createDocumentFragment();
        fn(root);
        expect(root.firstChild.tagName.toUpperCase()).toEqual('DIV');
    });

    it('create direct child "div > span"', function(){
        var fn = eval(xjade.compile(fixture('tagChild.xjade'), {compile: 'js'}));
        var root = document.createDocumentFragment();
        fn(root);
        expect(root.firstChild.tagName.toUpperCase()).toEqual('DIV');
        expect(root.firstChild.firstChild.tagName.toUpperCase()).toEqual('SPAN');
    });

    it('create div with attributes', function(){
        var fn = eval(xjade.compile(fixture('tagAttributes.xjade'), {compile: 'js'}));
        var root = document.createDocumentFragment();
        fn(root);
        var input = root.firstChild;
        expect(input.id).toEqual('some-id');
        expect(input.className).toEqual('class');
        expect(input.name).toEqual('name');
        expect(input.value).toEqual('value');
        expect(input.getAttribute('data-custom')).toEqual('custom');
        expect(input.getAttribute('hidden')).toEqual('hidden');
    });

    it('create div with attributes assigned js code values', function(){
        var fn = eval(xjade.compile(fixture('tagAttributesValue.xjade'), {compile: 'js'}));
        var root = document.createDocumentFragment();
        fn(root, 'id','name');
        var div = root.firstChild;
        expect(div.id).toEqual('id');
        expect(div.getAttribute('data-name')).toEqual('name');
    });
});
