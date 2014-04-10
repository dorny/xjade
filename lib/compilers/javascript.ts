/// <reference path="../d.ts/app.d.ts" />

import config = require('../config');
import utils = require('../utils');
import errors = require('../errors');
var ParserError = errors.ParserError;
var ICError = errors.ICError;
var IOError = errors.IOError;

var parserSource = require('../parser/source');
var parserTemplate = require('../parser/template');
var detectIndent = require('detect-indent');

var q = utils.quote;
var e = utils.escape;
var ri = utils.removeIndent;

export = Compiler;


class Compiler implements XJadeCompiler {

    filename: string;
    opts: XJadeOptions;

    buffer: string[] = [];

    indent: number = 0;
    indentToken;
    indentTokenLength;

    elIndex: number = -1;

    templateLineOffset = 0;
    currentLineOffset = 0;
    lastPrintedLineOffset;

    PARENT_TOKEN = 'parent';
    EL_TOKEN = 'el';
    NEXT_EL_TOKEN = 'el$';
    EXPR_TOKEN = '__expr';


    public compile(filename: string, opts: XJadeOptions) : string {
        this.filename = filename;
        this.opts = opts;

        // Read template file
        try {
            var template = opts.readFile(filename);
        } catch(e){
            throw new IOError(e);
        }

        // Indent settings
        this.indent = 0;
        this.indentToken = detectIndent(template) || '  ';
        if (this.indentToken=='\t') {
            this.indentTokenLength = 4;
        }
        else {
            this.indentTokenLength = this.indentToken.length;
        }


        // Parse source
        try {
            var nodes = parserSource.parse(template);
        }
        catch (e) {
            throw new ParserError(e.name, e.message, this.filename, e.line, e.column, e);
        }

        nodes.forEach((node)=> this.compileNode(node, null));
        return this.buffer.join('');
    }

    public append(str, noNewLine?) {
        if (this.currentLineOffset !== this.lastPrintedLineOffset) {
            this.lastPrintedLineOffset = this.currentLineOffset;
            var lineComment = '/* LINE: '+(this.templateLineOffset+this.currentLineOffset-1)+' */\n';
            str = lineComment + str;
        }

        str = utils.addIndent(str, this.indent, this.indentToken);
        if (!noNewLine) {
            str = str+'\n';
        }

        this.buffer.push(str);
    }

    private nextEl(tagName: string) : string {
        this.elIndex++;
        var name = tagName.replace(/[^\w$]/g, '')
        return name+'$'+this.elIndex;
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

        // Detect indentation level of template
        var index =  node.value.lastIndexOf('\n');
        if (index) {
            var length = node.value.slice(index).replace(/((\bvar)?\s*[\w$]+\s*[:=]\s*)?function\s+$/,'').length;
            this.indent = Math.floor(length / this.indentTokenLength);
        }
        else {
            this.indent = 0;
        }
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

        this.buffer.push((node.name||'')+'('+this.PARENT_TOKEN+args+') {\n');
        this.append(this.indentToken+'var '+this.EL_TOKEN+', '+this.EXPR_TOKEN+';');
        this.compileChildren(children, this.PARENT_TOKEN);
        this.append(this.indentToken+'return parent;');
        this.append('}', true);

        this.templateLineOffset = 0;
    }

    private compileCode(node: XJadeValueNode, parent: string) {
        this.append(ri(node.value, node.column));
    }

    private compileTag(tag: XJadeTagNode, parent: string) {
        var el = this.nextEl(tag.name);
        this.append('var '+el+' = '+this.EL_TOKEN+' = document.createElement('+q(tag.name)+');');

        if (tag.id) {
            this.append(el + '.id = ' + q(tag.id) + ';');
        }

        var classes =  q(tag.classes.join(' '));
        tag.conditionalClasses.forEach((cls)=> {
            classes+= '+('+this.escapeValue(cls)+' && '+q(' '+cls.name)+' || "")'
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
                    this.append('if ('+this.EXPR_TOKEN+'= '+this.escapeValue(attr)+') '+el+'.'+config.directAttrs[name]+' = '+this.EXPR_TOKEN+';');
                else
                    this.append(el+'.'+config.directAttrs[name]+' = '+this.escapeValue(attr)+';');
            }
            else {
                if (attr.value.type==='Code')
                    this.append('if ('+this.EXPR_TOKEN+'= '+this.escapeValue(attr)+') '+el+'.setAttribute(' + q(name)+', ' + this.EXPR_TOKEN+');');
                else
                    this.append(el+'.setAttribute(' + q(name)+', ' +  this.escapeValue(attr) + ');');
            }
        });
    }

    private compileTagChidlren(children: XJadeNode[], parent: string) {
        // set textContent rather ten appending text node (speed optimizaiton)
        if (children.length===1 && children[0].type==='Text') {
            var child = <XJadeValueNode> children[0];
            this.append(parent+'.textContent = '+this.escapeValue(child)+';');
        }
        else {
            this.compileChildren(children, parent);
        }
    }

    private compileText(node: XJadeValueNode, parent: string) {
        this.append(parent+'.appendChild( document.createTextNode('+this.escapeValue(node)+'));');
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
        var value = node.value
        switch (value.type) {
            case 'String':return e( ri(value.value, node.column));
            case 'Number': return q(value.value);
            case 'Code': return value.value;
            default: throw new ICError('Unknown value type: '+value.type, this.filename, this.line());
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
