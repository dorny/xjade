var config = require('../config');
var utils = require('../utils');

var parserSource = require('../parser/source');
var parserTemplate = require('../parser/template');
var _ = require('lodash');
var q = utils.quote;
var e = utils.escape;


var Compiler = (function () {
    function Compiler() {
        this.buffer = [];
        this.indent = 0;
        this.elIndex = -1;
        this.EL_TOKEN = '__el$';
    }
    Compiler.prototype.compile = function (filename, opts) {
        var _this = this;
        this.opts = opts;

        var template;

        template = opts.readFile(filename);

        var nodes = parserSource.parse(template);
        nodes.forEach(function (node) {
            return _this.compileNode(node, null);
        });
        return this.buffer.join('');
    };

    Compiler.prototype.append = function (str) {
        var _this = this;
        if (this.currentLineOffset !== this.lastPrintedLineOffset) {
            this.lastPrintedLineOffset = this.currentLineOffset;
            var lineComment = '/* LINE: ' + (this.templateLineOffset + this.currentLineOffset - 1) + ' */\n';
            this.buffer.push('\n' + this.makeIndent() + lineComment);
        }

        str = str.split('\n').map(function (ln) {
            return _this.makeIndent() + ln;
        }).join('\n') + '\n';
        this.buffer.push(str);
    };

    Compiler.prototype.makeIndent = function () {
        var space = '';
        for (var i = 0; i < this.indent; i++) {
            space += '  ';
        }

        return space;
    };

    Compiler.prototype.nextEl = function () {
        this.elIndex++;
        return this.EL_TOKEN + this.elIndex;
    };

    Compiler.prototype.compileNode = function (node, parent) {
        this.currentLineOffset = node.line;

        switch (node.type) {
            case 'OuterCode':
                this.compileOuterCode(node);
                break;

            case 'Template':
                this.compileTemplate(node);
                break;

            case 'Code':
                this.compileCode(node, parent);
                break;

            case 'Tag':
                this.compileTag(node, parent);
                break;

            case 'TagBody':
                this.compileTagBody(node, parent);
                break;

            case 'Text':
                this.compileText(node, parent);
                break;

            case 'Comment':
                this.compileComment(node, parent);
                break;

            default:
                throw new Error("ICE: unknown node type: " + node.type);
        }
    };

    Compiler.prototype.compileOuterCode = function (node) {
        this.buffer.push(node.value);
    };

    Compiler.prototype.compileTemplate = function (node) {
        var m = node.args.value.match(/^([a-zA-Z$_][a-zA-Z0-9$_]*)/);
        if (m === null) {
            throw {
                message: 'Template must have one or more arguments',
                line: node.args.line,
                offset: node.args.offset
            };
        }

        this.templateLineOffset = node.body.line;
        this.currentLineOffset = 0;
        this.lastPrintedLineOffset = 0;

        var el = m[1];
        try  {
            var nodes = parserTemplate.parse(node.body.value);
        } catch (e) {
            if (e.line === 1) {
                e.offset = e.offset + node.body.offset;
            }

            e.line = node.body.line + e.line - 1;
            throw e;
        }

        this.append('function ' + (node.name || '') + '(' + node.args.value + ') {');
        this.append('var el;');
        this.compileChildren(nodes, el);
        this.append('}');
    };

    Compiler.prototype.compileCode = function (node, parent) {
        this.append(node.value);
        if (node.children && node.children.length > 0) {
            this.append('{');
            this.compileChildren(node.children, parent);
            this.append('}');
        }
    };

    Compiler.prototype.compileTag = function (tag, parent) {
        var _this = this;
        var el = this.nextEl();
        this.append('var ' + el + ' = el = document.createElement(' + q(tag.name) + ');');

        if (tag.id) {
            this.append(el + '.id = ' + q(tag.id) + ';');
        }

        if (tag.classes.length > 0) {
            this.append(el + '.className = ' + q(tag.classes.join(' ')) + ';');
        }

        tag.attributes.forEach(function (attr) {
            var name = attr.name.toLowerCase();
            if (config.directAttrs.indexOf(name) != -1) {
                _this.append(el + '.' + name + ' = ' + _this.escapeValue(attr.value) + ';');
            } else {
                _this.append(el + '.setAttribute(' + q(name) + ', ' + _this.escapeValue(attr.value) + ');');
            }
        });

        if (tag.children.length > 0) {
            var skip = false;
            if (tag.children.length === 1 && tag.children[0].type === 'TagBody') {
                var body = tag.children[0];
                if (body.children.length === 1) {
                    var first = body.children[0];
                    if (first.type === 'Text') {
                        this.append(el + '.textContent = ' + this.escapeValue(first.value) + ';');
                        skip = true;
                    }
                }
            }

            if (!skip)
                this.compileChildren(tag.children, el);
        }

        this.append(parent + '.appendChild(' + el + ');');
    };

    Compiler.prototype.compileTagBody = function (tag, parent) {
        var _this = this;
        tag.children.forEach(function (child) {
            return _this.compileNode(child, parent);
        });
    };

    Compiler.prototype.compileText = function (node, parent) {
        this.append(parent + '.appendChild( document.createTextNode(' + this.escapeValue(node.value) + '));');
    };

    Compiler.prototype.compileComment = function (node, parent) {
        if (node.insert) {
            this.append(parent + '.appendChild( document.createComment(' + q(node.value) + '));');
        } else {
            this.append('/* ' + node.value + ' */');
        }
    };

    Compiler.prototype.compileChildren = function (nodes, parent) {
        var _this = this;
        this.indent++;
        nodes.forEach(function (child) {
            return _this.compileNode(child, parent);
        });
        this.indent--;
    };

    Compiler.prototype.escapeValue = function (node) {
        switch (node.type) {
            case 'String':
                return e(node.value);
            case 'Number':
                return q(node.value);
            case 'Code':
                return node.value;
            default:
                throw new Error('ICE: Unknown value type: ' + node.type);
        }
    };
    return Compiler;
})();
module.exports = Compiler;
