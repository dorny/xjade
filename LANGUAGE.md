## XJade Language Reference

* [Template](#template)
* [Tag](#tag)
  * [Tag Attributes](#tag-attributes)
  * [Conditional Classes](#conditional-classes)
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

Templates are embedded into JavaScript as syntax extension. 
All subsequent XJade grammar rules are applied only inside body of functions defined with this construct:

```
function @template [templateName] ( [arguments] ) { [body] }
```

XJade will translate template functions into regular JavaScript functions.
Function argument list will be prepended by `parent` - which will be used as a root `Node` where subsequent nodes will be appended:

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
* `__expr`: temporary expression result storage
* names like: `div$1`: temporary references to created nodes

When you call template function, first argument must be Node where child nodes will be appended.
Function will return its root node unles you explicitly return something else:
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
div#my-id.my-class
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
div[ .active=tab.isActive ]
```


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
XJade's inline tag syntax makes it ease to write tag statements between text nodes:
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


Multiple text nodes and inline child tags can be placed on a single line.
These body elemenets can be either on the same line as their parent tag
or on the following lines which are more indented as their parent tag:
```
span "Lorem Ipsum " ${user.name} " Lorem Ipsum"

div
  "Lorem Ipsum " ${user.name}     " Lorem Ipsum"
  "Lorem Ipsum " ${user.address}  " Lorem Ipsum"
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
  @for value, key
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
