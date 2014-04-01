var fs = require('fs');
var path = require('path')
var utils = require('./specUtils');
var xjade = require('../lib/xjade');

var document = utils.createDocument();
var fixture = function(name){ return path.join(__dirname,'fixtures','parent',name); };

describe('Parent Tags', function(){

    it('tag body', function(){
        var fn = eval(xjade.compile(fixture('tagBody.xjade'), {compile: 'js'}));
        var root = document.createDocumentFragment();
        fn(root);
        var div = root.firstChild;
        expect(div.childNodes.length).toEqual(2);
    });

    it('nested tags', function(){
        var fn = eval(xjade.compile(fixture('tagNested.xjade'), {compile: 'js'}));
        var root = document.createDocumentFragment();
        fn(root);
        expect(root.childNodes.length).toEqual(2);

        var div1 = root.childNodes[0];
        expect(div1.id).toEqual('div-1');
        expect(div1.childNodes.length).toEqual(1);

        var div1_1 = div1.childNodes[0];
        expect(div1_1.id).toEqual('div-1-1');
        expect(div1_1.childNodes.length).toEqual(1);
        expect(div1_1.firstChild.id).toEqual('div-1-1-1');

        var div2 = root.childNodes[1];
        expect(div2.id).toEqual('div-2');
        expect(div2.childNodes.length).toEqual(0);
    });
});
