/// <reference path="../d.ts/app.d.ts" />

import config = require('../config');
import utils = require('../utils');
import errors = require('../errors');
var ParserError = errors.ParserError;
var ICError = errors.ICError;
var IOError = errors.IOError;

var parserSource = require('../parser/source');
var parserTemplate = require('../parser/template');

var _ = require('lodash');
var q = utils.quote;
var e = utils.escape;

export = Compiler;


class Compiler implements XJadeCompiler {

    filename: string;
    opts: XJadeOptions;

    buffer: string[] = [];

    indent: number = 0;
    elIndex: number = -1;

    templateLineOffset = 0;
    currentLineOffset = 0;
    lastPrintedLineOffset;

    PARENT_TOKEN = 'parent';
    EL_TOKEN = 'el';
    NEXT_EL_TOKEN = '__el$';
    EXPR_TOKEN = '__expr';
    INDENT_TOKEN = '  ';

    public compile(filename: string, opts: XJadeOptions) : string {
        this.filename = filename;
        this.opts = opts;

        try {
            var template = opts.readFile(filename);
        } catch(e){
            throw new IOError(e);
        }

        var nodes = parserSource.parse(template);
        nodes.forEach((node)=> this.compileNode(node, null));
        return this.buffer.join('');
    }

    public append(str) {
        if (this.currentLineOffset !== this.lastPrintedLineOffset) {
            this.lastPrintedLineOffset = this.currentLineOffset;
            var lineComment = '/* LINE: '+(this.templateLineOffset+this.currentLineOffset-1)+' */\n';
            this.buffer.push('\n'+this.makeIndent()+lineComment);
        }

        str = str.split('\n').map((ln)=> this.makeIndent()+ln ).join('\n') + '\n';
        this.buffer.push(str);
    }

    private makeIndent() {
        var space = '';
        for(var i=0; i<this.indent; i++) {
            space += this.INDENT_TOKEN;
        }

        return space;
    }

    private nextEl(tagName: string) : string {
        this.elIndex++;
        var name = tagName.replace(/[^\w$]/g, '_')
        return '__'+tagName+'$'+this.elIndex;
    }

    private compileNode(node, parent) {
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
                throw new ICError("Unknown node type: "+node.type, this.filename, this.line(), null);
        }
    }

    private compileOuterCode(node: XJadeNode) {
        this.buffer.push(node.value);
    }

    private compileTemplate(node: XJadeTemplateNode) {
        this.templateLineOffset = node.body.line;
        this.currentLineOffset = 0;
        this.lastPrintedLineOffset = 0;

        try {
            var nodes = parserTemplate.parse(node.body.value);
        } catch (e) {
            var column = (e.line===1)
                ? e.column + node.body.column
                : e.column;

            throw new ParserError(e.name, e.message, this.filename, e.line, column, e);
        }

        var args = node.args
            ? ','+node.args
            : '';

        this.append((node.name||'')+'('+this.PARENT_TOKEN+args+') {');
        this.append(this.INDENT_TOKEN+'var '+this.EL_TOKEN+', '+this.EXPR_TOKEN+';');
        this.compileChildren(nodes, this.PARENT_TOKEN);
        this.append(this.INDENT_TOKEN+'return parent;');
        this.buffer.push('}');

        this.templateLineOffset = 0;
    }

    private compileCode(node: XJadeNode, parent: string) {
        this.append(node.value);
    }

    private compileTag(tag: XJadeTagNode, parent: string) {
        var el = this.nextEl(tag.name);
        this.append('var '+el+' = '+this.EL_TOKEN+' = document.createElement('+q(tag.name)+');');

        if (tag.id) {
            this.append(el + '.id = ' + q(tag.id) + ';');
        }

        var classes =  q(tag.classes.join(' '));
        tag.conditionalClasses.forEach((cls)=> {
            classes+= '+('+this.escapeValue(cls.value)+' && '+q(' '+cls.name)+' || "")'
        });

        if (classes!==q(''))
            this.append(el + '.className = ' + classes +';');

        this.compileTagAttribues(tag.attributes, el);
        this.compileTagChidlren(tag.children, el);
        this.append(parent+'.appendChild('+el+');');
    }

    private compileTagAttribues(attributes: XJadeNode[], el: string) {
        attributes.forEach((attr) => {
            var name = attr.name.toLowerCase();

            if (attr.value===null) {
                this.append(el+'.setAttribute(' + q(name)+','+q(name)+');');
            }
            else if (name in config.directAttrs) {
                if (attr.value.type==='Code')
                    this.append('if ('+this.EXPR_TOKEN+'= '+this.escapeValue(attr.value)+') '+el+'.'+config.directAttrs[name]+' = '+this.EXPR_TOKEN+';');
                else
                    this.append(el+'.'+config.directAttrs[name]+' = '+this.escapeValue(attr.value)+';');
            }
            else {
                if (attr.value.type==='Code')
                    this.append('if ('+this.EXPR_TOKEN+'= '+this.escapeValue(attr.value)+') '+el+'.setAttribute(' + q(name)+', ' + this.EXPR_TOKEN+');');
                else
                    this.append(el+'.setAttribute(' + q(name)+', ' +  this.escapeValue(attr.value) + ');');
            }
        });
    }

    private compileTagChidlren(children: XJadeNode[], el: string) {
        // if there are only one child and its type is "Text"
        // set textContent rather ten appending text node (speed optimizaiton)
        var skip = false;
        if (children.length===1 && children[0].type==='TagBody') {
            var body = children[0];
            if (body.children.length===1) {
                var first = body.children[0];
                if (first.type==='Text') {
                    this.append(el+'.textContent = '+this.escapeValue(first.value)+';');
                    skip = true;
                }
            }
        }

        if (!skip)
            this.compileChildren(children, el);
    }

    private compileTagBody(tag: XJadeTagNode, parent: string) {
        tag.children.forEach( (child) => this.compileNode(child, parent) );
    }

    private compileText(node: XJadeNode, parent: string) {
        this.append(parent+'.appendChild( document.createTextNode('+this.escapeValue(node.value)+'));');
    }

    private compileComment(node: XJadeNode, parent: string) {
        if (node.insert) {
            this.append(parent+'.appendChild( document.createComment('+q(node.value)+'));');
        }
        else {
            this.append('/* '+node.value+' */')
        }
    }

    private compileChildren(nodes: XJadeNode[], parent: string) {
        this.indent++;
        nodes.forEach( (child) => this.compileNode(child, parent) );
        this.indent--;
    }

    private escapeValue(node: XJadeNode) {
        switch (node.type) {
            case 'String':return e(node.value);
            case 'Number': return q(node.value);
            case 'Code': return node.value;
            default: throw new ICError('Unknown value type: '+node.type, this.filename, this.line());

        }
    }

    private line() {
        return this.templateLineOffset + this.currentLineOffset -1;
    }
}
