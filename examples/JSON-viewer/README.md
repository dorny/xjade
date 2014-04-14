# XJade JSON Viewer example

Example project for [XJade](https://github.com/dorny/xjade) HTML DOM Template Engine.

XJade is here used on both sides: server side static index.html
and client side function to generate formated view of JSON object.
As example effective development workflow, we used [grunt-xjade](https://github.com/dorny/xjade) plugin
and template is loaded using [require.js](http://requirejs.org/) module loader.


## Instalation

```shell
npm install .
```

## Compile templates

If you don't have installed `grunt-cli` package, install it first:  

```
npm install -g grunt-cli
```

Now you can use command:
```
grunt
```

to compile source templates and open `www/index.html` in browser to see result.
