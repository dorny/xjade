[![Build Status](https://travis-ci.org/dorny/xjade.png?branch=master)](https://travis-ci.org/dorny/xjade)
[![Dependency Status](https://gemnasium.com/dorny/xjade.png)](https://gemnasium.com/dorny/xjade)

**WARNING - THIS PROJECT IS AT AN EARLY DEVELOPMENT STAGE**

# XJade

XJade is a new template language which accelerates and simplifies building complex dynamic user interfaces in JavaScript.  


##  Features
* **Readable short-hand HTML** - XJade uses indented CSS selectors to describe node trees.
* **DOM structure** - Elements are created using standard browser DOM API.
* **Embedded into JavaScript** - Templates are written inside regular JavaScript files.
* **Server side support** - Generate your static HTML files with XJade and never write HTML again.
* **Easy integration** - works with AMD/CommonJS modules, TypeScript or any binding library.
* **Simplicity** - It's only about CSS selectors syntax and JavaScript, not a whole new language.


## Why Use Template Engine?
* DOM API is too verbose.
* HTML String concatenation is security hole and hard to read (no HTML syntax highlightig, no multiline strings, etc.).
* jQuery or other libs are still verbose and messy if chain calls doesn't fit your logic.
* Cloning prearranged node trees don't work well with conditions or when you need references to nodes inside template.


## Why Use XJade Over Alternatives?

XJade has unique balanced set of features and simplicity.  
There are no other template engine which:  
* has nice CSS like syntax inside JavaScript files
* generates DOM structure instead of string
* logic is written in plain JavaScript rather another abstract syntax
* templates are pre-compiled
* can be used with AMD/CommonJS, TypeScript or anything else because each embedded template will be replaced with single function
* has no runtime dependencies (excpet DOM API ofcourse)


## Instalation


### Command line
After installing the latest version of [node](http://nodejs.org/), install with:

```shell
npm install -g xjade
```

#### Usage:
<pre>
Usage: xjade [options] [...files]

Options:

  -h, --help             output usage information
  -V, --version          output the version number
  -c, --compile &lt;kind&gt;   Specify compiler: 'js' (default), 'html' or 'ast'.
  --doctype &lt;str&gt;        Specify doctype: '5' (default), 'strict', 'transitional', 'xhtml' or other.
  --data &lt;str&gt;           Filename or string with input data input JSON format.
  -p, --pretty           Print pretty HTML.

</pre>

Command line version outputs compiled templates to it's standard output.
To save your templates to file use [Redirection](http://en.wikipedia.org/wiki/Redirection_(computing)).


### Grunt plugin (recommended)
* [grunt-xjade](https://github.com/dorny/grunt-xjade) - This is the best way how to integrate XJade into your project.


### IDE support
* [sublime-xjade](https://github.com/dorny/sublime-xjade) - Syntax highlighting and snippets for [Sublime Text](http://www.sublimetext.com/) editor.


## Syntax

TODO

## Examples:

* [XJade JSON viewer](https://github.com/dorny/xjade-example-json)


## License

MIT


## Acknowledgements

### Maindata
Developing firts prototype of XJade was supported by [MAINDATA](http://www.maindata.info/)  
![MAINDATA](https://dl.dropboxusercontent.com/u/40395608/MD-logo.png)


### Jade
[Jade](http://jade-lang.com/) was first template engine I have used.  
This project started as try to fix Jade client side limitations. That's why it was named XJade.  

### Other

Thanks to [PEG.js](http://pegjs.majda.cz/) for amazing parser generator.  
Thanks to [Blade](https://github.com/bminer/node-blade) for idea of forking Jade and using PEG.js.  
Thanks to [ist.js](http://njoyard.github.io/ist/) for idea of using DOM API directly rather then strings.  
