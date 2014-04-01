/// <reference path="../d.ts/app.d.ts" />
import config = require('../config');
import utils = require('../utils');

var parserSource = require('../parser/source');
var parserTemplate = require('../parser/template');
var _ = require('lodash');
var q = utils.quote;
var e = utils.escape;

export = Compiler;


class Compiler implements XJadeCompiler {

    opts: XJadeOptions;

    buffer: string[] = [];

    indent: number = 0;
    elIndex: number = -1;

    templateLineOffset;
    currentLineOffset;
    lastPrintedLineOffset;

    EL_TOKEN = '__el$';
    INDENT_TOKEN = '  ';

    public compile(filename: string, opts: XJadeOptions) : string {
        this.opts = opts;
        var template = opts.readFile(filename);
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

    private nextEl() : string {
        this.elIndex++;
        return this.EL_TOKEN + this.elIndex;
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
                throw  new Error("ICE: unknown node type: "+node.type);
        }
    }

    private compileOuterCode(node: XJadeNode) {
        this.buffer.push(node.value);
    }

    private compileTemplate(node: XJadeTemplateNode) {
        var m = node.args.value.match(/^([a-zA-Z$_][a-zA-Z0-9$_]*)/);
        if (m===null) {
            throw {
                message: 'Template must have one or more arguments',
                line: node.args.line,
                offset: node.args.offset
            }
        }

        this.templateLineOffset = node.body.line;
        this.currentLineOffset = 0;
        this.lastPrintedLineOffset = 0;

        var el = m[1];
        try {
            var nodes = parserTemplate.parse(node.body.value);
        } catch (e) {
            if (e.line===1) {
                e.offset = e.offset + node.body.offset;
            }

            e.line = node.body.line + e.line -1;
            throw e;
        }

        this.append(node.prefix+' '+(node.name||'')+'('+node.args.value+') {');
        this.append(this.INDENT_TOKEN+'var el;');
        this.compileChildren(nodes, el);
        this.buffer.push('}');
    }

    private compileCode(node: XJadeNode, parent: string) {
        this.append(node.value);
    }

    private compileTag(tag: XJadeTagNode, parent: string) {
        var el = this.nextEl();
        this.append('var '+el+' = el = document.createElement('+q(tag.name)+');');

        if (tag.id) {
            this.append(el + '.id = ' + q(tag.id) + ';');
        }

        if (tag.classes.length>0) {
            this.append(el + '.className = ' + q(tag.classes.join(' ')) +';');
        }

        tag.attributes.forEach((attr)=>{
            var name = attr.name.toLowerCase();

            if (name in config.directAttrs) {
                this.append(el+'.'+config.directAttrs[name]+' = '+ this.escapeValue(attr.value)+';');
            }
            else {
                this.append(el+'.setAttribute(' + q(name)+', ' +  this.escapeValue(attr.value) + ');');
            }
        })

        if (tag.children.length>0) {

            var skip = false;
            if (tag.children.length===1 && tag.children[0].type==='TagBody') {
                var body = tag.children[0];
                if (body.children.length===1) {
                    var first = body.children[0];
                    if (first.type==='Text') {
                        this.append(el+'.textContent = '+this.escapeValue(first.value)+';');
                        skip = true;
                    }
                }
            }

            if (!skip)
                this.compileChildren(tag.children, el);
        }

        this.append(parent+'.appendChild('+el+');');
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
            default: throw new Error('ICE: Unknown value type: '+node.type);
        }
    }

}
