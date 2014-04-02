/** XJade language grammar for use with PEG.js
    (c) Copyright 2014. Michal Dorner. All rights reserved.
**/


/* ===== Initialize ===== */
{
  var g_indent = null;
  var g_parent = null;

  // util for concatenation head|tail patterns
  var concat=function(head,tail,pos) {
    (pos !== undefined) || (pos=1);
    var result = [head];
    for (var i=0; i<tail.length; i++)
      result.push(tail[i][pos]);
    return result;
  }
}

/* ===== Start ===== */

Start
  = EOL* nodes:Nodes? __
      { return nodes || [] }

Nodes
  = head:ChildNode tail:(EOL+ ChildNode)*
     { return concat(head,tail) }


/* ===== Lexical Grammar ===== */

EscapedChar "Escaped character"
    = "\\" .

WhiteSpace "Whitespace"
  = [\t\v\f \u00A0\uFEFF]
  / Zs

// Separator, Space
Zs = [\u0020\u00A0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000]

WhitespaceMultiLine "Whitespace multiLine"
  = (WhiteSpace / LineTerminatorSequence)*

LineTerminator "LineTerminator"
  = [\n\r\u2028\u2029]

LineTerminatorSequence "End of line"
  = "\n"
  / "\r\n"
  / "\r"
  / "\u2028" // line separator
  / "\u2029" // paragraph separator

StringLiteral "String literal"
  = $("'" (EscapedChar / [^'])* "'")
  / $('"' $(EscapedChar / [^"])* '"')

NumberLiteral "Number literal"
  = $([0-9]+)

RegularExpression "Regular expression"
  = "/" RegularExpressionChar* "/" flags:[a-zA-Z]*

RegularExpressionChar
  = EscapedChar
  / RegularExpressionClass
  / [^/]

RegularExpressionClass
  = "[" RegularExpressionClassChar* "]"

RegularExpressionClassChar
  = EscapedChar
  / [^\]]


CurlyBrackets "CurlyBrackets: {...}"
  = "{" body:CurlyBracketsBody "}"
      { return body }

CurlyBracketsBody
  = $(CurlyBracketsBodyElement*)

CurlyBracketsBodyElement
  = BracketsBodyElement
  / CurlyBrackets
  / [^}]

BracketsBodyElement
  = StringLiteral
  / RegularExpression
  / Comment


/* ===== Basic Rules ===== */
_
  = WhiteSpace

__
  = WhitespaceMultiLine

EOL
  = _* LineTerminatorSequence

TextToEol
  = $(!LineTerminator .)*

Identifier
  = $([a-zA-Z][a-zA-Z0-9_:-]*)

JSIdentifier
  = $([a-zA-Z$_][a-zA-Z0-9$_]*)

String
  = value:StringLiteral
      { return { type: 'String', value: value} }

Number
  = value:NumberLiteral
    { return { type: 'Number', value: value} }

Code
  = code:CurlyBrackets
   { return {type: 'Code', value: code} }

Value
  = String
  / Number
  / Code


/* ===== Tags ===== */

TagName "Tagname"
  = Identifier

ClassName
  = $("-"?[_a-zA-Z]+[_a-zA-Z0-9-]*)

AttributeName
   = $([a-zA-Z][a-zA-Z0-9_:.-]*)


TagID "Tag ID"
  = "#" id:Identifier
      {return id}

TagClass "Tag class"
  = "." cls:ClassName
     {return cls}

TagAttribute "Tag attribute"
  = name:AttributeName value:("=" Value)?
      {
        return {
          type: 'TagAttribute',
          name: name,
          value: value? value[1] : null
        }
      }

TagAttributeElement "Tag attribute element"
  = TagAttribute
  / Comment

TagAttributes "Tag attributes [ ... ]"
  = "[" __ body:TagAttributesBody? __ "]"
    { return body||[] }

TagAttributesBody
  = head:TagAttributeElement tail:(__ TagAttributeElement)*
      { return concat(head,tail)}



TagChild "Tag inline child: > Tag"
  = _* ">" _* tag:Tag
     { return tag }

TagInline "TagInline: #{...}"
  = "#{" _* tag: Tag _* "}"
      { return tag }



TagBody "Tag body"
  = head:TagBodyElement tail:(_* TagBodyElement)*
     { return {type:'TagBody', children: concat(head, tail)} }

TagBodyElement
  = node:( Text / TextCode / TagInline / Comment)
      {
        node.line = line();
        node.column = column();
        return node;
      }


Tag "Tag"
  = tag:(
      name:TagName id:TagID? cls:TagClass* attrs:TagAttributes? _* body:(TagChild/TagBody)? {
        return {name: name, id: id, cls: cls, attrs: attrs, body: body}
      }
      / id:TagID cls:TagClass* attrs:TagAttributes? _* body:(TagChild/TagBody)? {
        return {name: 'div', id: id, cls: cls, attrs: attrs, body: body}
      }
      / cls:TagClass+ attrs:TagAttributes? _* body:(TagChild/TagBody)? {
        return {name: 'div', id: null, cls: cls, attrs: attrs, body: body}
      }
  ) {
    return {
      type: 'Tag',
      name: tag.name,
      id: tag.id,
      classes: tag.cls || [],
      attributes: tag.attrs || [],
      children: tag.body ? [tag.body] : []
    }
  }



/* ===== Nodes ===== */

Text
  = text:String
      { return {type: 'Text', value: text} }

TextCode "TextCode ${...}"
  = "$" code:Code
      { return {type: 'Text', value: code} }


Comment "Comment"
  = MultiLineComment
  / SingleLineComment



MultiLineComment "Multiline Comment: /*...*/"
  = "/*" insert:">"? value:$(!"*/" .)* "*/"
      {
        return {
          type: 'Comment',
          value: value,
          insert: insert!=null
        }
      }

SingleLineComment "Single Line Comment // ..."
 = "//" insert:">"? value:TextToEol
      {
        return {
          type: 'Comment',
          value: value,
          insert: insert!=null
        }
      }


CodeLine
  = "-" _+ value:TextToEol
     { return {type: 'Code', value: value}; }

CodeBlock
  = code:$(Code)
     { return {type: 'Code', value: code}; }


/* ===== Parent & child Node ===== */

Indents "Indentation"
  = $(("\t"/" ")*)

ChildLine
  = child_indent:Indents &{ return child_indent.length > g_indent} text:TextToEol
      {
        var indent = child_indent.splice(child_indent.length - g_indent)
        return  indent + text
      }

RawBlock
  = head:TextToEol tail:(EOL+ ChildLine)*
      { return concat(head, tail, 1).join('\n') }

ParentNode
  = node:Tag
      {
        node._indent = g_indent
        node.parent = g_parent
        g_parent = node
        return node
      }


ChildNode
  = child_indent:Indents
    &{
      if (g_parent===null || child_indent.length > g_parent._indent) {
        g_indent = child_indent.length
        return true
      }
      return false
    }
    child:Node
      {return child}


Node
  = node:ParentNode children:(EOL+ child:ChildNode {return child})*
      {
        g_indent =  node.parent ? node.parent._indent : 0;
        g_parent = node.parent;
        delete node.parent;
        delete node._indent;
        node.children = node.children.concat(children);
        node.line = line();
        node.column = column();
        return node;
      }
  /
    node:( TagBody / CodeLine / CodeBlock )
      {
        node.line = line();
        node.column = column();
        return node;
      }
