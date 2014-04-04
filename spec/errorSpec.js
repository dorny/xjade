var fs = require('fs');
var path = require('path');

var xjade = require('../lib/xjade');
var utils = require('../lib/utils');
var errors = require('../lib/errors');

var fixture = function(name){ return path.relative(process.cwd(), path.join(__dirname,'fixtures','error',name)); };

describe('Error reporting', function(){

    it('should throw IOError - ENOENT', function(){
        var filename = fixture('not-here.js-tpl');
        var fn = function(){ xjade.compile(filename, {compile: 'html'}); };
        var err = new errors.IOError(new Error("ENOENT, no such file or directory '"+filename+"'"));
        expect(fn).toThrow(err);
    });

    it('should throw ParserError at invalid tag name', function(){
        var filename = fixture('invalidTagName.js-tpl');
        var fn = function(){ xjade.compile(filename, {compile: 'html'}); };
        var err = new errors.ParserError(
            'SyntaxError',
            'Expected "-", CurlyBrackets: {...}, End of line, Tag, Tag body, Whitespace or end of input but "@" found.',
            filename,
            3,9
        );

        expect(fn).toThrow(err);
    });

    it('should throw ParserError at missing root argmuent', function(){
        var filename = fixture('missingRoot.js-tpl');
        var fn = function(){ xjade.compile(filename, {compile: 'html'}); };
        var err = new errors.ParserError(
            'SyntaxError',
            'Template must have one or more arguments',
            filename,
            1, 37
        );

        expect(fn).toThrow(err);
    });

    it('should throw RuntimeError', function(){
        var filename = fixture('runtimeError.js-tpl');
        var fn = function() { xjade.compile(filename, {compile: 'html'}); };

        expect(fn).toThrow();

        try {
            fn();
        } catch (e) {
            expect(e instanceof errors.RuntimeError).toBe(true);
            expect(e.filename).toEqual(filename);
        }

    });

});
