/** XJade language grammar for use with PEG.js
    (c) Copyright 2014. Michal Dorner. All rights reserved.
**/


/* ===== Initialize ===== */
{
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
  = __  nodes:Nodes? __ UnexpectedToken?
      { return nodes || [] }

Nodes
  = head:Node tail:(__ Node)*
     { return concat(head,tail) }

Node
  = node:(Tag / Text / Code / Comment)
      {
        node.line = line();
        node.column = column();
        return node;
      }


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


CurlyBrackets "Curly brackets: {...}"
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



/* ===== Tags ===== */

ClassName
  = $("-"?[_a-zA-Z]+[_a-zA-Z0-9-]*)

AttributeName
   = $([a-zA-Z][a-zA-Z0-9_:.-]*)

AttributeValue
  = String
  / Number
  / RoundCode



TagName "Tagname"
  = Identifier

TagID "Tag ID"
  = "#" id:(Identifier / UnexpectedToken)
      { return id; }

TagClass "Tag class"
  = "." name:(ClassName / UnexpectedToken)
     { return name; }

TagAttribute "Tag attribute"
  = name:AttributeName value:("=" AttributeValue)?
      {
        return {
          type: 'TagAttribute',
          name: name,
          value: value? value[1] : null
        };
      }

TagConditionalClass
  = "." name:ClassName "=" value:AttributeValue
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


TagBody
  = TagAssignedText
  / TagInlineChild
  / TagBodyBlock

TagAssignedText
  = __ "=" __ text:Text
    { return text; }

TagInlineChild "Tag inline child: > Tag"
  = __ ">" __ tag:Tag
     { return tag; }

TagBodyBlock
  = __ "{" !"{" __ children:Nodes?  __ ("}" / UnexpectedToken)
      {
        return {
          type: 'TagBodyBlock',
          children: children || []
        };
      }


Tag "Tag"
  = tag:(
      name:TagName id:TagID? cls:TagClass* attrs:TagAttributes? __ body:TagBody? {
        return {name: name, id: id, cls: cls, attrs: attrs, body: body}
      }
      / id:TagID cls:TagClass* attrs:TagAttributes? __ body:TagBody? {
        return {name: 'div', id: id, cls: cls, attrs: attrs, body: body}
      }
      / cls:TagClass+ attrs:TagAttributes? __ body:TagBody? {
        return {name: 'div', id: null, cls: cls, attrs: attrs, body: body}
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
        body: tag.body
      }
  }



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
  / CodeBlock

CodeLine
  = "-" _+ value:TextToEol
     { return {type: 'Code', value: value}; }

CodeBlock
  = "{" code:CurlyCode "}"
      { return code }



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
