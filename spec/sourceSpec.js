var fs = require('fs');
var path = require('path')
var xjade = require('../lib/xjade');

var fixture = function(name){ return path.relative(process.cwd(), path.join(__dirname,'fixtures','source',name)); };


describe('Source compilation', function(){

    it('should not change source without templates', function(){
        var filename = fixture('none.xjade');
        var source = xjade.compile(filename, {compile:'js'});
        var original = fs.readFileSync(filename).toString();
        expect(source).toEqual(original);
    });

    it('should compile to empty render function', function(){
        var filename = fixture('empty.xjade');;
        var source = xjade.compile(filename, {compile:'js'});
        expect(source).toEqual('function render(parent) {\n  var el, __expr;\n  return parent;\n}\n');
    });

    it('should compile multiple templates', function(){
       var filename = fixture('multiple');
       var source = xjade.compile(filename+'.xjade', {compile:'js'});
       var correct = fs.readFileSync(filename+'.js').toString();
       expect(source).toEqual(correct);
    });

});
