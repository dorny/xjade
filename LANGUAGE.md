## XJade Language Reference

* [Template](#template)
* [Tag](#tag)
  * [Tag Attributes](#tag-attributes)    
  * [Element Properties](#element-properties)
  * [Class Expresions](#class-expresions)
* [Tag Content](#tag-content)
  * [Text](#text)
  * [Child Tag](#child-tag)
  * [Inline Tag](#inline-tag)
  * [Nesting Tags and Text](#nesting-tags-and-text)
* [Directives](#directives)
  * [Conditionals](#conditionals)
  * [Iteration](#iteration)
  * [Switch](#switch)  
* [JavaScript Code](#javascript-code)
  * [Line](#line)
  * [Block](#block)
* [Comments](#comments)


### Template

Templates are embedded into JavaScript using anotated functions:
```
function @template [templateName] ( [arguments] ) { [body] }
```


When you call template function, you have to pass aditional first argument, which will be used as template root:
```
var render = @template (arg1, arg2) { … };
var node = render( document.createElement('div'), arg1, arg2);

// If you pass null, a new documentFragment will be used:
var fragment = render( null, arg1, arg2);
```


Reserved variable names inside template function:
* `parent`: root element, where child nodes will be appended
* `__expr`: temporary expression result storage
* names like: `div$1`: temporary references to created nodes



### Tag

XJade uses syntax simlar to CSS selectors to specify elements:
```
  tagName #tagID .tagClasses* [ (attribute|property|classExpression)* ]
```

Only one of the name, ID or classes must be specified, others are optional.
If tag name is omited, it defaults to `div`.

Example:
```
div#my-id
div#my-id.some-class
#header
.container
```

#### Tag Attributes
Attribute is set using simple `name=value` syntax, where value is any JavaScript expression:
```
input[ name="username" type="text" ]
a[ href=project.homepage ]

// If you append question mark to attribute name,
// attribute will be set only if value expression evaluates to true
span[ hidden?=isHidden ]
```

#### Element Properties
XJade's property syntax allows setting element properties directly:

```
a[ .href="www.github.com" ]

// This will generate code like this:
// var a = document.createElement('a');
// a.href = "www.github.com"
```

#### Class Expresions
XJade's class expresions are shorthand for dynamically added classes:
```
// string value of tab.state will be added to div's className
div[ class(tab.state) ]

// add "active" class to div only if tab.isActive is true
div[ class("active")=tab.isActive]
```


### Tag Content

#### Text
Text nodes are created with:  
* Single or Double quotes
* JavaScript expresion as `${ … }`
* Tag text content assignment as `tag= …`

Don't worry about escaping HTML special chars, all text will be automatically escaped by DOM.
```
'some text'  "some other text"
'tab: \t and no-break space: \u00a0'

"Leading whitespaces inside multiline
 strings will be removed up to the indentation level of starting quote mark.
"

${user.name}
div= user.name
```

#### Child Tag
If tag has only one child tag, you can use shorthand `parent > child` syntax:
```
li > a[href="#link1"] "Link 1"
```

#### Inline Tag
XJade's inline tag syntax makes it easy to write tag statements between text nodes:
```
div "click " #{ a[href="http://www.google.com"] "here"} " to go to www.google.com"
```

#### Nesting Tags and Text
Simply indent to put nested tags or text inside of a tag:
```
html
  head
    script[ src="app.js" type="text/javascript" ]
  body
    #content
      'Lorem ipsum'
```



### Directives

Directives starts with `@` character and are used as control flow statements.


#### Conditionals
XJade's conditional syntax allows for optional parenthesis, otherwise it's still just regular javascript:

```
@if user.isLoggedIn
  div.welcome "Hi " ${user.name} "!"

@else if user.isBlocked
  div.error "Forbidden"

@else
  div.login
    input[ name="username" type="text"]
    input[ name="password" type="password"]
    button[ name="login" ]
```

#### Iteration
XJade's iteration syntax makes it easier to iterate over arrays and objects within a template:
```
// Iterate over array:
ul
  @each user,index in users
    li ${index} ':' ${user}

// Iterate over object:
ul
  @for value, key in data
    li ${key} ':' ${value}

// index/key variable names are optional
```


#### Switch
XJade's swtich syntax is in parallel with JavaScript's switch statement and takes the following form:
```
  @switch user.type
    @case 'admin'
      a[href="/admin"] Administration

    @case 'user'
      a[href="/profile"] Profile

    @default
       "some default content"
```



### JavaScript Code

XJade allows to write arbitrary JavaScript code inside templates.  
This can be used especially for:
* call another template function
* store reference to created node
* declare or manipulate variables

Inside JavaScript block, you can use special `@el` variable.
XJade will replace it with variable holding reference to current Node.

#### Line
Single line of JavaScript code starts with `-` and all code to the end of line will appear unchanged in generated function:

```
- var days = ["Monday","Tuesday", "Wednesday"];
- console.log( days );
```

#### Block
Multiline block with JavaScript code can be written inside curly brackets `{ … }`:

```
function @template(clickHandler, exports) {
  div
    {
      @el.addEventListener('click', clickHandler, false);
      exports.div = @el;
    }
}
```

### Comments

* Single line: `// this is comment`
* Single line HTML: `//> this will be inserted as HTML comment`
* Block: `/* this is block comment */` 
* Block HTML: `/*> this will be inserted as HTML comment */`
