var fs = require('fs');
var path = require('path');
var utils = require('../lib/utils');
var xjade = require('../lib/xjade');

var document = utils.createDocument();
var fixture = function(name){ return path.relative(process.cwd(), path.join(__dirname,'fixtures','tag',name)); };


describe('Tags', function(){

    it('should create <div>', function(){
        var fn = eval(xjade.compile(fixture('tagName.xjade'), {compile: 'js'}));
        var root = fn(null);
        expect(root.firstChild.tagName.toUpperCase()).toEqual('DIV');
    });

    it('should create div with "#some-id"', function(){
        var fn = eval(xjade.compile(fixture('tagID.xjade'), {compile: 'js'}));
        var root = fn(null);
        expect(root.firstChild.id).toEqual('some-id');
    });

    it('should create with classes ".class1 class2"', function(){
        var fn = eval(xjade.compile(fixture('tagClasses.xjade'), {compile: 'js'}));
        var root = fn(null);
        expect(root.firstChild.className).toEqual('class1 class2');
    });

    it('should create inline "#{div}"', function(){
        var fn = eval(xjade.compile(fixture('tagInline.xjade'), {compile: 'js'}));
        var root = fn(null);
        expect(root.firstChild.tagName.toUpperCase()).toEqual('DIV');
    });

    it('should create direct child "div > span"', function(){
        var fn = eval(xjade.compile(fixture('tagChild.xjade'), {compile: 'js'}));
        var root = fn(null);
        expect(root.firstChild.tagName.toUpperCase()).toEqual('DIV');
        expect(root.firstChild.firstChild.tagName.toUpperCase()).toEqual('SPAN');
    });

    it('should create div with attributes', function(){
        var root;
        var templates = eval(xjade.compile(fixture('tagAttributes.xjade'), {compile: 'js'}));

        root = templates.novalue(null);
        expect(root.firstChild.hasAttribute('data-ok')).toBe(true);

        root = templates.value(null);
        expect(root.firstChild.getAttribute('data-ok')).toEqual('ok');
        expect(root.firstChild.getAttribute('data-true')).toEqual('true');
        expect(root.firstChild.hasAttribute('data-false')).toBe(false);

        root = templates.property(null);
        expect(root.firstChild.id).toEqual('ok');

        root = templates.classExpr(null);
        expect(root.firstChild.className).toEqual('class-ok class-true');
    });
});
