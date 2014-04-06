[![Build Status](https://travis-ci.org/dorny/xjade.png?branch=master)](https://travis-ci.org/dorny/xjade)
[![Dependency Status](https://gemnasium.com/dorny/xjade.png)](https://gemnasium.com/dorny/xjade)

**WARNING - THIS PROJECT IS AT AN EARLY DEVELOPMENT STAGE**

# XJade

XJade is a new template language which accelerates and simplifies building dynamic user interfaces in JavaScript.  


##  Features
* **Readable short-hand HTML** - XJade uses indented CSS selectors to describe node trees.
* **DOM structure** - Elements are created using standard browser DOM API.
* **Embedded into JavaScript** - Templates are written inside regular JavaScript files.
* **Server side support** - Generate your static HTML files with XJade and never write HTML again.
* **Easy integration** - works with AMD/CommonJS modules, TypeScript or any binding library.
* **Simplicity** - It's only about CSS selectors syntax and JavaScript, not a whole new language.


## Why Use Template Engine?
* DOM API is too verbose.
* HTML String concatenation is security hole and hard to read (no HTML syntax highlightig, no multiline strings...).
* jQuery or other libs are still verbose and messy if chain calls doesn't fit your logic.
* Cloning prearranged node trees don't work well with conditions or many value bindings.


## Why Use XJade Over Alternatives?

XJade has unique balanced set of features and simplicity.  
There are no other template engine which:  
* has nice CSS like syntax inside JavaScript files
* generates DOM structure instead of string
* logic is written in plain JavaScript rather another abstract syntax
* templates are pre-compiled
* can be used with AMD/CommonJS, TypeScript or anything else because each embedded template will be replaced with single function


## Instalation


### Command line
After installing the latest version of [node](http://nodejs.org/), install with:

```shell
npm install -g xjade
```


### Grunt plugin (recommended)
* [grunt-xjade](https://github.com/dorny/grunt-xjade)


### Sublime Text plugin
* [sublime-xjade](https://github.com/dorny/sublime-xjade)


## Syntax

TODO

## Examples:

* [XJade JSON viewer](https://github.com/dorny/xjade-example-json)

## Acknowledgements

TODO
