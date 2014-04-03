#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var util = require('util');
var program = require('commander');
var xjade = require('../lib/xjade');


program.version(xjade.version);
program
  .usage('[options] [...files]')
  .option('-c, --compile <kind>", "Compile template with specified compiler: "js"|"html"|"ast"', String, "js")
  .option('--doctype <str>", "Doctype: "5"|"strict"|"transitional"|"frameset"|"xhtml"|"xhtml"|"xhtml"|"xhtml"|"basic"|"mobile" or custom', String, '5')
  .option('-l, --locals <str>', 'JSON string to be used as the locals object')
  .option('-p, --pretty', 'Print pretty HTML')
  .option('--std-out', 'Print result to stdout');

program.parse(process.argv);

var files = program.args;
var compilerOpts = {};

var compilerExt = {
  html: 'html',
  js: 'js',
  ast: 'txt'
};

if (program.locals) {
	compilerOpts.locals = JSON.parse(program.locals);
}

compilerOpts.compile = program.compile;
compilerOpts.doctype = program.doctype;
compilerOpts.pretty = program.pretty;


files.forEach(function(filename){
  var output;
  var ext = compilerExt[program.compile] || program.compile;

  try {
    output = xjade.compile(filename, compilerOpts);
    writeOutput(filename, ext, output);
  }
  catch(e) {
    console.error(e.message || e)
    process.exit(1)
  }
})


function writeOutput(filename, ext, data) {
  if (program.stdOut) {
    process.stdout.write(data);
  }
  else {
    var fn = filename.replace(/\.[^\/.]+$/,'') + '.' + ext;
    fs.writeFile(fn, data);
  }
}
