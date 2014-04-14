[![Build Status](https://travis-ci.org/dorny/xjade.png?branch=master)](https://travis-ci.org/dorny/xjade)
[![Dependency Status](https://gemnasium.com/dorny/xjade.png)](https://gemnasium.com/dorny/xjade)

**WARNING - THIS PROJECT IS AT AN EARLY DEVELOPMENT STAGE**

# XJade - DOM Templating Engine

XJade is a new template engine which accelerates and simplifies building complex dynamic user interfaces in JavaScript.
Write your GUI templates in nice shorthand declarative way and let XJade do the hard work for you.
XJade will generate well optimized code which uses native DOM methods like createElement(), setAttribute() or appendChild()
to build parts of your GUI directly in client browser.

Check it out:
* [**What is new**](CHANGES.md)
* [**Language Reference**](LANGUAGE.md)
* [**TODO list**](TODO.md)



##  Features
* **Readable short-hand HTML** - XJade uses indented CSS selectors to describe node trees.
* **Embedded into JavaScript** - Templates are written inside anotated JavaScript functions.
* **DOM structure** - Elements are created using standard native DOM API.
* **Client side performance** - super fast on Chrome! See this [benchmark](http://jsperf.com/xjade-benchmarks/2) for more info. 
* **Server side support** - Generate your static HTML files with XJade and never write HTML again.
* **Easy integration** - works with AMD/CommonJS modules, TypeScript or any binding library.



## Why Use XJade?
* DOM API is too verbose.
* HTML String concatenation is error prone, possible security hole and hard to read (no HTML syntax highlightig, no multiline strings, etc.).
* jQuery or other libs are still verbose and messy when you need more complex structure.
* Cloning prearranged node trees doesn't work well with conditions or when you need references to created nodes inside template.
* Most other template engines:
    * uses either verbose HTML or weird custom syntax
    * works with strings instead of direct DOM manipulation
    * uses mixins, partials, blocks and other own constructs instead of simple function calls



## How to work with XJade?:
1. Write your view code which dynamically generates DOM structures with XJade templates into .xjade files.
1. Watch and compile your .xjade files with grunt.
1. Use any module loader or plain script tags to include your compiled sources.
1. Call compiled XJade functions with some root node or null as their first argument.



## Instalation

### Command line
After installing the latest version of [node](http://nodejs.org/), install with:
```shell
npm install -g xjade
```

#### Usage:
```
Usage: xjade [options] [...files]

Options:

  -h, --help             output usage information
  -V, --version          output the version number
  -c, --compile <kind>   Specify compiler: 'js' (default), 'html' or 'ast'.
  --doctype <str>        Specify doctype: '5' (default), 'strict', 'transitional', 'xhtml' or other.
  --data <str>           Filename or string with input data input JSON format.
  -p, --pretty           Print pretty HTML.
```

Command line version outputs compiled templates to it's standard output.
To save your templates to file use [Redirection](http://en.wikipedia.org/wiki/Redirection_(computing)).


### Grunt plugin (recommended)
* [grunt-xjade](https://github.com/dorny/grunt-xjade) - This is the best way how to integrate XJade into your project.


### IDE support
* [sublime-xjade](https://github.com/dorny/sublime-xjade) - Syntax highlighting and snippets for [Sublime Text](http://www.sublimetext.com/) editor.



## Server side usage

Althought XJade primary target is Browser, it's possible to use it on server side as static HTML files generator.
Set XJade `compile` option to `html` to compile and execute input file and all its includes to single HTML output.
Your input template must have exported `render` function.
Data object (see XJade compiler options) will be passed as its first argument.

Use cases:
* Generate index.html for single page application with same syntax as client side templates
* Generate complex static HTML files from separated sub templates and data parameters

Example (index.xjade):
```
exports.render = function @template () {
    html
        head
            script[src="app.js"]
            link[href="style.css" rel="stylesheet" type="text/css"]
        body
            'This HTML was generated by XJade!'
};
```

Generate pretty formated HTML with:
```
xjade -c html -p index.xjade
```



## License

MIT



## Acknowledgements

### MAINDATA
Developing firts prototype of XJade was supported by [MAINDATA](http://www.maindatainc.com).  
[![MAINDATA](https://dl.dropboxusercontent.com/u/40395608/MD-logo.png)](http://www.maindatainc.com)


### Jade
[Jade](http://jade-lang.com/) was first template engine I have used.  
This project started as try to fix Jade's client side limitations. That's why it was named XJade.  

### Other

Thanks to [PEG.js](http://pegjs.majda.cz/) for amazing parser generator.  
Thanks to [Blade](https://github.com/bminer/node-blade) for idea of forking Jade and using PEG.js.  
Thanks to [ist.js](http://njoyard.github.io/ist/) for idea of using DOM API directly rather then strings.  
