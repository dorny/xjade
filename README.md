[![Build Status](https://travis-ci.org/dorny/xjade.png?branch=master)](https://travis-ci.org/dorny/xjade)
[![Dependency Status](https://gemnasium.com/dorny/xjade.png)](https://gemnasium.com/dorny/xjade)

**WARNING - THIS PROJECT IS AT AN EARLY DEVELOPMENT STAGE**

# XJade

XJade is a new template language which accelerates and simplifies building complex dynamic user interfaces in JavaScript.  


It works like:

1. Write your view code which dynamically generates HTML with XJade tempaltes into .xjade files.
1. Watch and compile your .xjade files with grunt.
1. Use any module loader or plain script tags to include your compiled sources.
1. Call generated functions with root node as its first argument


## Table of Contents

* [Features](#features)
* [Why Use XJade?](#why-use-xjade)
* [Instalation](#instalation)
    * [Grunt plugin](#grunt-plugin-recommended)
    * [IDE support](#ide-support)
* [Syntax](#syntax)
    * [Template](#template)
    * [Tag](#tag)
        * [Tag Attributes](#tag-attributes)
        * [Conditional Classes](#conditional-classes)
        * [Text](#text)
        * [Child Tag](#child-tag)
        * [Inline Tag](#inline-tag)
        * [Nesting Tags and Text](#nesting-tags-and-text)
    * [JavaScript Code](#javascript-code)
        * [Line](#line)
        * [Block](#block)
    * [Comments](#comments)
* [Server side usage](#server-side-usage)
* [License](#license)
* [Acknowledgements](#acknowledgements)



##  Features

* **Readable short-hand HTML** - XJade uses indented CSS selectors to describe node trees.
* **Embedded into JavaScript** - Templates are written inside JavaScript files.
* **DOM structure** - Elements are created using standard browser DOM API.
* **Client side performance** - see this [benchmark](http://jsperf.com/xjade-benchmarks). 
* **Server side support** - Generate your static HTML files with XJade and never write HTML again.
* **Easy integration** - works with AMD/CommonJS modules, TypeScript or any binding library.
* **Simplicity** - It's only about CSS selectors syntax and JavaScript, not a whole new language.



## Why Use XJade?

* DOM API is too verbose.
* HTML String concatenation is security hole and hard to read (no HTML syntax highlightig, no multiline strings, etc.).
* jQuery or other libs are still verbose and messy if chain calls doesn't fit your logic.
* Cloning prearranged node trees don't work well with conditions or when you need references to created nodes inside template.
* Most other template engines with CSS like syntax:
    * uses only string concatenation method
    * conditionals, loops etc. uses their own special syntax instead of plain JavaScript
    * uses mixins, partials, blocks and other own constructs instead of simple function calls
    * force you to have only one template per file with limited options for module loading method.



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

### Template

Templates are embedded into JavaScript as syntax extension. 
All subsequent XJade grammar rules are applied only inside body of functions defined with this construct:

```abnf
function @template [templateName] ( [arguments] ) { [body] }
```

Xjade will translate template functions into regular JavaScript functions.
Function argument list will be prepended by `parent` - which will be used as a root `Node` where subsequent nodes will be appended.

Example:
```
exports.render = function @tempalte(arg1, arg2, argN) { /* body */ }
```
will be compiled to:  
```
exports.render = function (parent, arg1, arg2, argN) { /* body */ }
```

Example:
```
// You can also use template as class method in TypeScript:  
class MyView {
    public @template render() {
        /* body */
    }
}
```

Reserved variable names inside template function:
* `parent`: root element, where child nodes will be appended
* `__el`: holds reference to lastly created element node
* `__expr`: temporary expression result storage
* names like: `__div$1`: temporary references to created nodes

When you call template function, first argument must be Node where child nodes will be appended.
Template function does not clear its root node before starts processing.
Function will return its root node unles you explicitly return something else.

Example:
```
var render = @template (name) { … };
var node = render( document.createElement('div'), 'Some name');
```


### Tag

Syntax of tag statement is based on CSS selectors:  
```
    tagName #tagID .tagClasses* [ tagAttributes ]
```

Only one of the name, ID or classes must be specified, others are optional.
White-spaces between name, ID and classes are not allowed.
If tag name is omited, it defaults to `div`.

Example:
```
div#my-id.class-1.class-2.class-n
span.error.strong
#header
.container
```

#### Tag Attributes
Tag attributes can be set inside square brackets `[ … ]`.
Start brace must follow imediatelly after tag declaration (no white-spaces).
Inside attributes block, you can use white-spaces and comments.
Attribute is set using `name=value` syntax and individual attributes are delimited by one or more white-space characters.

Value can be one of:
* String - single or double quoted
* Number - only positive integer
* Expression - any JavaScript expression

Example:
```
input[ name="username" type="text" ]
span[ data-rating=5 ]
a[ href=project.homepage ]
span[ data-count=(user.count+1) ]
```

If attribute value is determined by JavaScript expression, attribute will be set only if expression evalutes to true.


#### Conditional Classes
It's possible to set specific class on tag only if some expression evaluates to true.
Syntax for this is same as with attributes, except class name starts with ".".

Example:
```
div[ .active=tab.active ]
```



#### Text
Text nodes are created with:  
* Single quotes
* Double quotes
* JavaScript expresion as `${ … }`
* Tag text assignment as `tag= …`

Strings (outside JS expression) can be multiline and you don't have to explicitly escape it.
Do not use HTML codes like `&gt;` or `&nbsp`, they won't work.
Instead use character directly (`<`) or escape/unicode sequence like `\u00a0` for non-breaking space.

Example:
```
'some text'
"some other text"
'text with newline character at the end \n'
"multi line
string"
${user.name}
div= user.name
```

#### Child Tag
If tag has only one child tag, you can use shorthand inline syntax `parent > child`.
Example:

```
li > a[href="#link1"] "Link 1"
```


#### Inline Tag
Tag can be also created with inline syntax.
It starts with: `#{` and ends with `}`.
If you use this method, indentation parent/child rules as described bellow will not apply inside #{…}.

Example:
```
div "click " #{ a[href="http://www.google.com"] "here"} " to go to www.google.com"
```


#### Nesting Tags and Text 
Simply indent to put nested tags or text inside of a tag.
You can indent with any number of spaces or tabs but do not mix them.

Example:
```
html
    head
        script[ src="app.js" type="text/javascript" ]
    body
        #content
```        

renders as:
```html
<html>
    <head>
        <script src="app.js" type="text/javascript"></script>
    </head>
    <body>
        <div id="content"></div>
    </body>
</html>
```

Multiple text nodes and inline child tags can be placed on a single line.
Text and inline childs can be placed on a same line as their parent tag
or any of the following lines which are more indented as their parent tag.

Example:
```
span "Lorem Ipsum " ${user.name} " Lorem Ipsum"

div
    "Lorem Ipsum " ${user.name}     " Lorem Ipsum"
    "Lorem Ipsum " ${user.address}  " Lorem Ipsum"
```


### JavaScript Code

XJade allows puting arbitrary JavaScript code inside templates.  
This allows things like:
* Controll flow - conditions, loops, etc.
* Call to another template function
* Store reference to created node
* Declare or manipulate variables

    
#### Line
Single line of JavaScript code starts with `-`.
All code to the end of line will appear unchanged in generated function.

Example:  
```
- if (user.isLoggedIn) {
    div.welcome "Hi " ${user.name} "!"
- } else {
    div.login
        input[ name="username" type="text"]
        input[ name="password" type="password"]
        button[ name="login" ]
- }
```

Example:
```
ul
    - users.forEach( function(user, i) {
        li ${user.name}      
    - });
```

**Important: ** Allways use `{` and `}` with conditions, single line tag statement may be translated to multiple lines of code.


#### Block

Multiline block with JavaScript code can be written inside curly brackets `{ … }`.

Example:
```
function @template(clickHandler, exports) {
    div
        "Lorem Impsum"   
        span
        {
            // `el` always holds reference to lastly created node.
            el.onclick = clickHandler;
            exports.span = el;
        }
}
```

### Comments

* Single line: `// this is comment`
* Single line HTML: //> this will be inserted as HTML comment
* Block: `/* this is comment */` 
* Block HTML: `/*> this will be inserted as HTML comment */`



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
var content = require('./content');

exports.render = function @template () {
    html
        head
            script[src="app.js"]
            link[href="style.css" rel="stylesheet" type="text/css"]
        body
            - content.render(el);
};
```

Generate pretty formated HTML with:
```
xjade -c html -p index.xjade
```

Do not use XJade templates as per request HTML generator, it was not designed for it.

### How it works
 
XJade works on server side with emulated DOM API and serializes result document.
For this purpose [jsdom-little](https://github.com/dorny/jsdom-little) is used.
This allows single code base for client and server version, but it's slow compared to pure string generation.

Templates are executed using node.js [vm.runInNewContext(…)](http://nodejs.org/api/vm.html#vm_vm_runinnewcontext_code_sandbox_filename)
with injected `require(…)` function to process includes and global document variable for creating nodes.



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
