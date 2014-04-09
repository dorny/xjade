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
  = EOL* nodes:Nodes? __ UnexpectedToken?
      { return nodes || [] }

Nodes
  = head:ChildNode tail:(EOL+ ChildNode)*
     { return concat(head,tail) }


/* ===== Lexical Grammar ===== */

EscapedChar "Escaped character"
    = "\\" .

Whitespace "Whitespace"
  = [\t\v\f \u00A0\uFEFF]
  / Zs

// Separator, Space
Zs = [\u0020\u00A0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000]

WhitespaceMultiLine "Whitespace multiLine"
  = (Whitespace / LineTerminatorSequence)*

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


CurlyBrackets "Curly Brackets: {...}"
  = "{" body:CurlyBracketsBody "}"
      { return body }

CurlyBracketsBody
  = $(CurlyBracketsBodyElement*)

CurlyBracketsBodyElement
  = BracketsBodyElement
  / CurlyBrackets
  / [^}]

RoundBrackets "Round brackets: (...)"
  = "(" body:RoundBracketsBody ")"
      { return body; }

RoundBracketsBody
  = $(RoundBracketsBodyElement*)

RoundBracketsBodyElement
  = BracketsBodyElement
  / RoundBrackets
  / [^)]

SquareBrackets "Square brackets: (...)"
  = "[" body:SquareBracketsBody "]"
      { return body; }

SquareBracketsBody
  = $(SquareBracketsBodyElement*)

SquareBracketsBodyElement
  = BracketsBodyElement
  / SquareBrackets
  / [^\]]

BracketsBodyElement
  = StringLiteral
  / RegularExpression
  / Comment


/* ===== Basic Rules ===== */
_
  = Whitespace

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

CurlyCode
  = code:CurlyBrackets
   { return {type: 'Code', value: code} }

RoundCode
  = code:RoundBrackets
   { return {type: 'Code', value: code} }

Operator
  = "++"
  / "--"
  / "+"
  / ">>"
  / "<<"
  / ">>>"
  / [<>] "="?
  / [+*/-] "="
  / "-="
  / "*="
  / [+*/!~-]

ExpressionParts
  = JSIdentifier ("." JSIdentifier)*
  / StringLiteral
  / NumberLiteral
  / RegularExpression
  / Comment
  / RoundBrackets
  / SquareBrackets
  / CurlyBrackets
  / __ Operator __ ExpressionParts?

Expression
  = code:$(ExpressionParts+)
  { return {type: 'Code', value: code} }

Value
  = String
  / Number !Operator
  / Expression

/* ===== Tags ===== */

TagName "Tagname"
  = Identifier

ClassName
  = $("-"?[_a-zA-Z]+[_a-zA-Z0-9-]*)

AttributeName
   = $([a-zA-Z][a-zA-Z0-9_:.-]*)



TagID "Tag ID"
  = "#" id:(Identifier / UnexpectedToken)
      { return id; }

TagClass "Tag class"
  = "." name:(ClassName / UnexpectedToken)
     { return name; }

TagAttribute "Tag attribute"
  = name:AttributeName value:("=" Value)?
      {
        return {
          type: 'TagAttribute',
          name: name,
          value: value? value[1] : null
        };
      }

TagConditionalClass
  = "." name:ClassName "=" value:Value
      {
        return {
          type: 'TagConditionalClass',
          name: name,
          value: value
        };
      }

TagAttributeElement "Tag attribute element"
  = TagAttribute
  / TagConditionalClass
  / Comment

TagAttributes "Tag attributes [ ... ]"
  = "[" __ body:TagAttributesBody? __  ("]" / UnexpectedToken)
    { return body||[]; }

TagAttributesBody
  = head:TagAttributeElement tail:(__ TagAttributeElement)*
      { return concat(head,tail); }

Tag "Tag"
  = tag:(
      name:TagName id:TagID? cls:TagClass* attrs:TagAttributes? {
        return {name: name, id: id, cls: cls, attrs: attrs}
      }
      / id:TagID cls:TagClass* attrs:TagAttributes? {
        return {name: 'div', id: id, cls: cls, attrs: attrs}
      }
      / cls:TagClass+ attrs:TagAttributes? {
        return {name: 'div', id: null, cls: cls, attrs: attrs}
      }
  ) {
      var attrs = tag.attrs || []
      return {
        type: 'Tag',
        name: tag.name,
        id: tag.id,
        classes: tag.cls || [],
        conditionalClasses: attrs.filter(function(attr){ return attr.type==='TagConditionalClass' }),
        attributes: attrs.filter(function(attr){ return attr.type==='TagAttribute' }),
        children: []
      }
  }


TagBody "Tag body"
  = _* head:TagBodyElement tail:(_* TagBodyElement)*
      {
        return {
          type:'TagBody',
          children: concat(head, tail)
        };
      }

TagBodyElement
  = node:(Comment / Text / Code / TagInline)
      {
        node.line = line();
        node.column = column();
        return node;
      }

TagInline "TagInline: #{...}"
  = "#{" _* tag: TagDirectParentChild _* ("}" / UnexpectedToken)
      { return tag; }




TagDirectParent
  = tag:Tag child:(TagChild / TagAssignment / TagBody)
      {
        tag.children.push(child);
        return tag;
      }

TagDirectParentChild
  = tag:Tag child:(TagChild / TagAssignment / TagBody)?
      {
        if (child)
          tag.children.push(child);
        return tag;
      }

TagChild "Tag inline child: > Tag"
  = _* ">" _* tag:(TagDirectParentChild)
     { return tag; }

TagAssignment
  = _* "=" _* code:Value
      { return code; }


/* ===== Text ===== */

Text
  = TextString
  / TextCode

TextString
  = text:String
      { return {type: 'Text', value: text} }

TextCode "TextCode ${...}"
  = "$" code:CurlyCode
      { return {type: 'Text', value: code} }



/* ===== Comments ===== */

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



/* ===== Code ===== */

Code
  = CodeLine
  / CurlyCode

CodeLine
  = "-" _+ value:TextToEol
     { return {type: 'Code', value: value}; }



/* ===== Parent & child Node ===== */

Indents "Indentation"
  = $(("\t"/" ")*)


ParentTag
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
  = node:(TagBody/TagDirectParent)
      {
        node.line = line();
        node.column = column();
        return node;
      }

  / node:ParentTag children:(EOL+ child:ChildNode {return child})*
      {
        g_indent =  node.parent ? node.parent._indent : 0;
        g_parent = node.parent;
        delete node.parent;
        delete node._indent;

        node.children = children;
        node.line = line();
        node.column = column();
        return node;
      }


/* ===== Unexpected Token ===== */

InvalidChars
  = str: $( !(Whitespace/LineTerminator) .)+
      {
        return {
          text: str,
          offset: offset(),
          line: line(),
          column: column()
        }
      }

UnexpectedToken
  = token:InvalidChars & {
    throw new SyntaxError('Unexpected token: '+token.text, null, token.text, token.offset, token.line, token.column)
  }
