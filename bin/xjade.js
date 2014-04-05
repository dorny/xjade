#!/usr/bin/env node

var fs = require('fs');
var program = require('commander');
var xjade = require('../lib/xjade');


program.version(xjade.version);
program
  .usage('[options] [...files]')
  .option('-c, --compile <kind>"',"Specify compiler: 'js' (default), 'html' or 'ast'.", String, "js")
  .option('--doctype <str>"', "Specify doctype: '5' (default), 'strict', 'transitional', 'xhtml' or other.", String, '5')
  .option('--data <str>', 'Filename or string with input data input JSON format.')
  .option('-p, --pretty', 'Print pretty HTML.')

program.parse(process.argv);

var files = program.args;
var data;
if (program.data) {
  if (fs.existsSync(program.data))
    data = JSON.parse(fs.readFileSync(program.data).toString());
  else
    data = JSON.parse(program.data);
}

var compilerOpts = {
  compile: program.compile,
  doctype: program.doctype,
  pretty: program.pretty,
  data: data,
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
