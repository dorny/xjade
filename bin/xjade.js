#!/usr/bin/env node

var fs = require('fs');
var program = require('commander');
var xjade = require('../lib/xjade');


program.version(xjade.version);
program
  .usage('[options] [...files]')
  .option('-c, --compile <kind>", "Compile template with specified compiler: "js"|"html"|"ast"', String, "js")
  .option('--doctype <str>", "Doctype: "5"|"strict"|"transitional"|"frameset"|"xhtml"|"xhtml"|"xhtml"|"xhtml"|"basic"|"mobile" or custom', String, '5')
  .option('-l, --locals <str>', 'JSON string to be used as the locals object')
  .option('-p, --pretty', 'Print pretty HTML')

program.parse(process.argv);

var files = program.args;

var compilerOpts = {
  compile: program.compile,
  doctype: program.doctype,
  pretty: program.pretty,
  locals: program.locals ? JSON.parse(program.locals) : null,
}


try {
  var output = '';
  files.forEach(function(filename){
    output += xjade.compile(filename, compilerOpts);
  });
  process.stdout.write(output);
}
catch(e) {
  console.error(e.message || e)
  process.exit(1)
}
