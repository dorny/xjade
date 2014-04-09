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

        try {
            var nodes = parserSource.parse(template);
        }
        catch (e) {
            throw new ParserError(e.name, e.message, this.filename, e.line, e.column, e);
        }

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
        var name = tagName.replace(/[^\w$]/g, '')
        return '__'+tagName+'$'+this.elIndex;
    }

    private compileNode(node, parent) {

        if (node.line!=null) {
            this.currentLineOffset = node.line;
        }


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

    private compileOuterCode(node: XJadeValueNode) {
        this.buffer.push(node.value);
    }

    private compileTemplate(node: XJadeTemplateNode) {
        this.templateLineOffset = node.body.line;
        this.currentLineOffset = 0;
        this.lastPrintedLineOffset = 0;

        try {
            var nodes = parserTemplate.parse(node.body.value);
            var children = this.flatmapTagBody(nodes);
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
        this.compileChildren(children, this.PARENT_TOKEN);
        this.append(this.INDENT_TOKEN+'return parent;');
        this.buffer.push('}');

        this.templateLineOffset = 0;
    }

    private compileCode(node: XJadeValueNode, parent: string) {
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

        if (classes!==q('')) {
            this.append(el + '.className = ' + classes +';');
        }

        this.compileTagAttribues(tag.attributes, el);

        var children = this.flatmapTagBody(tag.children);
        this.compileTagChidlren(children, el);

        this.append(parent+'.appendChild('+el+');');
    }

    private compileTagAttribues(attributes: XJadeTagAttribute[], el: string) {
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

    private compileTagChidlren(children: XJadeNode[], parent: string) {
        // set textContent rather ten appending text node (speed optimizaiton)
        if (children.length===1 && children[0].type==='Text') {
            var child = <XJadeValueNode> children[0];
            this.append(parent+'.textContent = '+this.escapeValue(child.value)+';');
        }
        else {
            this.compileChildren(children, parent);
        }
    }

    private compileText(node: XJadeValueNode, parent: string) {
        this.append(parent+'.appendChild( document.createTextNode('+this.escapeValue(node.value)+'));');
    }

    private compileComment(node: XJadeCommentNode, parent: string) {
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

    private escapeValue(node: XJadeValueNode) {
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

    private flatmapTagBody(children) {
        var result = []
        for (var i = 0; i < children.length; i++) {
            if (children[i].type==='TagBody')
                result = result.concat(children[i].children);
            else
                result.push(children[i])
        };
        return result
  }
}
