**WARNING - THIS PROJECT IS AT AN EARLY DEVELOPMENT STAGE**

# XJade - HTML DOM Template Language

XJade is a new template language for elegant HTML DOM creation in JavaScript.


##  Features
* **Readable short-hand HTML** - XJade uses indented CSS selectors to describe node trees.
* **Simplicity** - almost nothing to learn, it's only about CSS selectors and JavaScript.
* **Client side Performance** - XJade directly uses DOM API for creation elements.
* **No runtime dependencies** - except document object from DOM of course :).
* **Easy integration** - works with AMD/CommonJS modules, TypeScript etc.
* **Server side support** - generate your static HTML files with XJade and never write HTML again.


## Why use XJade?

Writing readable and safe code for dynamic creation of HTML nodes in JavaScript is not so easy.
HTML itself is a mess and concatenation of HTML strings may lead to security holes. There is no HTML syntax highlightig inside strings nor multiline support. Another problem is when you need references to nodes defined somewhere inside of HTML string. You have to find them manulay later, probabbly by using CSS selectors which is error prone and brings performance drawbacks.

On the other hand DOM API is simply too verbose for generating complicated views.
Ain't Nobody Got Time For That. Period.
Even if you use some DOM builder library, it will still be ugly and verbose.


### XJade vs Jade

[Jade](http://jade-lang.com/) is probably most used template engine in JavaScript world.
It's feature rich, mature project, but for client side usage has some drawbacks:

* It uses HTML string concatenation - not so good for client side.
* Include feature will copy whole contet of template - duplicated code.
* Not so close to CSS Selectors
* Too many features. Template language should be as simple as possible.


In fact, my experience with Jade, inspired me to start this project.


## Instalation

In few days XJade will by available via npm.


## Usage

TODO

## Syntax

TODO

## Acknowledgements

TODO
