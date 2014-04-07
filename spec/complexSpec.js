var fs = require('fs');
var path = require('path')
var utils = require('../lib/utils');
var xjade = require('../lib/xjade');

var document = utils.createDocument();
var fixture = function(name){ return path.relative(process.cwd(), path.join(__dirname,'fixtures','complex',name)); };


describe('Complex example', function(){

    it('should generate same html as index.html', function(){
        var actual = xjade.compile(fixture('index.xjade'), {compile: 'html', pretty:true});
        var expected = fs.readFileSync(fixture('index.html')).toString();
        expect(actual).toEqual(expected);
    });
});
