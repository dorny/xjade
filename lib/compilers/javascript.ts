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

    indent: number;
    indentToken;
    indentTokenLength;

    elIndex: number;

    templateLineOffset = 0;
    currentLineOffset = 0;
    lastPrintedLineOffset;

    PARENT_TOKEN = 'parent';
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

            case 'Directive':
                this.compileDirective(node, parent);
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
        this.elIndex = 0;

        try {
            var nodes = parserTemplate.parse(node.body.value);
        } catch (e) {
            var line = this.templateLineOffset + e.line -1;
            var column = (e.line===1)
                ? e.column + node.body.column
                : e.column;

            throw new ParserError(e.name, e.message, this.filename, line, column, e);
        }

        var args = node.args
            ? ','+node.args
            : '';

        this.buffer.push((node.name||'')+'('+this.PARENT_TOKEN+args+') {\n');
        this.append(this.indentToken+'var '+this.EXPR_TOKEN+';');
        this.append(this.indentToken+'if (parent==null) parent=document.createDocumentFragment();')
        this.compileChildren(nodes, this.PARENT_TOKEN);
        this.append(this.indentToken+'return '+this.PARENT_TOKEN+';');
        this.append('}', true);

        this.templateLineOffset = 0;
    }

    private compileCode(node: XJadeValueNode, parent: string) {
        var code = ri(node.value, node.column);
        this.append( utils.replaceEl(code, parent));
    }

    private compileDirective(node: XJadeDirectiveNode, parent: string) {
        switch (node.name) {
            case 'If':
                this.append('if ('+node.expr+') {');
                this.compileChildren(node.children, parent);
                this.append('}');
                break;

            case 'Else':
                this.append('else {');
                this.compileChildren(node.children, parent);
                this.append('}');
                break;

            case 'ElseIf':
                this.append('else if ('+node.expr+') {');
                this.compileChildren(node.children, parent);
                this.append('}');
                break;

            case 'Each':
                var tmp = this.nextEl(this.EXPR_TOKEN);
                this.append('var '+tmp+' = '+ node.expr+';');
                var key = node.key || this.nextEl('i');
                var len = this.nextEl('l');
                this.append('for (var '+key+'=0, '+len+'='+tmp+'.length; '+key+'<'+len+'; ++'+key+') {')
                this.append(this.indentToken+'var '+node.value+' = '+tmp+'['+key+'];');
                this.compileChildren(node.children, parent);
                this.append('}');
                break;

            case 'For':
                var tmp = this.nextEl(this.EXPR_TOKEN);
                this.append('var '+tmp+' = '+ node.expr+';');
                var key = node.key || this.nextEl('i');
                this.append('for (var '+key+' in '+tmp+') {')
                this.append(this.indentToken+'var '+node.value+' = '+tmp+'['+key+'];');
                this.compileChildren(node.children, parent);
                this.append('}');
                break;

            case 'Switch':
                this.append('switch ('+node.expr+') {')
                this.compileChildren(node.children, parent);
                this.append('}');
                break;

            case 'Case':
                this.append('case '+node.expr+':');
                if (node.children.length>0) {
                    this.compileChildren(node.children, parent);
                    this.append(this.indentToken+'break;');
                }
                break;

            case 'Default':
                this.append('default:');
                this.compileChildren(node.children, parent);
                break;

            default:
                throw new ICError("Unknown Directive name: "+node.name, this.filename, this.line(), null);
        }
    }


    private compileTag(tag: XJadeTagNode, parent: string) {
        var el = this.nextEl(tag.name);
        this.append('var '+el+' = document.createElement('+q(tag.name)+');');

        if (tag.id) {
            this.append(el + '.id = ' + q(tag.id) + ';');
        }

        this.compileTagClasses(tag, el);
        this.compileTagAttribues(tag.attributes, el);
        this.compileChildren(tag.children, el, true);
        this.append(parent+'.appendChild('+el+');');
    }

    private compileTagClasses(tag: XJadeTagNode, el: string) {
        var classes =  q(tag.classes.join(' '));

        tag.classExprs.forEach((expr)=> {
            if (expr.value)
                classes+= '+('+expr.value+' && (" "+'+expr.name+') || "")';
            else
                classes+= '+'+expr.name;
        });

        if (classes!==q('')) {
            this.append(el + '.className = ' + classes +';');
        }
    }

    private compileTagAttribues(attributes, el: string) {
        attributes.forEach((attr) => {

            switch (attr.type) {
                case 'Comment':
                    this.compileComment(attr, el);
                    break;

                case 'TagProperty':
                    if (attr.onlyTrue)
                        this.append('if ('+this.EXPR_TOKEN+'= '+attr.value+') '+el+'.'+attr.name+' = '+this.EXPR_TOKEN+';');
                    else
                        this.append(el+'.'+attr.name+' = '+attr.value+';');
                    break;

                case 'TagAttribute':
                    var value = attr.value || q(attr.name);
                    if (attr.onlyTrue)
                        this.append('if ('+this.EXPR_TOKEN+'= '+value+') '+el+'.setAttribute(' + q(attr.name)+', ' + this.EXPR_TOKEN+');');
                    else
                        this.append(el+'.setAttribute('+q(attr.name)+', '+value+');');
                    break;

                default:
                    throw new ICError("Unknown TagAttribute type: "+attr.type, this.filename, this.line(), null);
            }
        });
    }

    private compileChildren(children: XJadeNode[], parent: string, isSafeParent?) {
        children = this.optimizeChildren(children);
        // set textContent rather ten appending text node (speed optimizaiton)
        if (isSafeParent && children.length===1 && children[0].type==='Text') {
            var child = <XJadeValueNode> children[0];
            this.append(parent+'.textContent = '+this.escapeValue(child.value)+';');
        }
        else {
            this.indent++;
            children.forEach( (child) => this.compileNode(child, parent) );
            this.indent--;
        }
    }

    private compileText(node: XJadeValueNode, parent: string) {
        this.append(parent+'.appendChild( document.createTextNode('+this.escapeValue(node.value, node.column)+'));');
    }

    private compileComment(node: XJadeCommentNode, parent: string) {
        if (node.insert) {
            this.append(parent+'.appendChild( document.createComment('+q(node.value)+'));');
        }
        else {
            this.append('/* '+node.value+' */')
        }
    }

    private escapeValue(node: XJadeValueNode, removeIndent?: number) {
        switch (node.type) {
            case 'String':
                return removeIndent != null
                    ? e( ri(node.value, removeIndent))
                    : e(node.value);

            case 'Number':
                return q(node.value);

            case 'Code':
                return node.value;

            default: throw new ICError('Unknown value type: '+node.type, this.filename, this.line());
        }
    }

    private line() {
        return this.templateLineOffset + this.currentLineOffset -1;
    }

    private flatmapTagBody(children) {
        var result = [];
        children.forEach((child)=> {
            if (child.type==='TagBody')
                result = result.concat(child.children);
            else
                result.push(child)
        });
        return result;
    }

    private concatText(children) {
        var code = children.map((text)=> this.escapeValue(text.value, text.column));

        var result = children[0];
        result.value.type = 'Code';
        result.value.value = code.join('+');
        return result;
    }

    private optimizeChildren(children) {
        children = this.flatmapTagBody(children);
        var result = [];
        var textBuffer = [];

        children.forEach((child)=> {
            if (child.type==='Text') {
                textBuffer.push(child);
            }
            else {
                if (textBuffer.length) {
                    result.push(this.concatText(textBuffer));
                    textBuffer = [];
                }
                result.push(child);
            }
        });

        if (textBuffer.length) {
            result.push(this.concatText(textBuffer));
        }

        return result;
    }
}
