/** XJade language grammar for use with PEG.js
    (c) Copyright 2014. Michal Dorner. All rights reserved.
**/


/* ===== Start ===== */

Start
  = first:Template? body:(OuterCode Template)* tail:OuterCode?
    {
      var nodes = [];
      if (first) {
        nodes.push(first);
      }

      for (var i=0; i<body.length; i++) {
        nodes.push(body[i][0]);
        nodes.push(body[i][1]);
      }

      if (tail) {
        nodes.push(tail);
      }

      return nodes;
    }


Template
  =  prefix:TemplatePrefix __ "template*" __ name:JSIdentifier? __ args:TemplateArguments __ body:TemplateBody
  {
    return {
      type:"Template",
      prefix: prefix,
      name: name,
      args: args,
      body: body,
      line: line(),
      column: column(),
    };
  }

TemplatePrefix
  = "function"
  / "public"
  / "private"

TemplateArguments
  = code:RoundBrackets
      {
        return {
          type: 'TemplateArguments',
          value: code,
          line: line(),
          column: column()
        };
      }

TemplateBody
  = code:CurlyBrackets
      {
        return {
          type: 'TemplateBody',
          value: code,
          line: line(),
          column: column() + 1
        };
    }

OuterCode
  = value:$(OuterCodeBlock+ TemplateDelimiter?)
    {
      return {
        type: 'OuterCode',
        value: value,
        line: line(),
        column: column()
      };
    }

OuterCodeBlock
  = Comment
  / StringLiteral
  / RegularExpression
  / !(TemplateDelimiter Template) .

TemplateDelimiter
  = WhiteSpace / LineTerminator / [=:;,(){}[\]]


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


StringLiteral
  = $("'" (EscapedChar / [^'])* "'")
  / $('"' $(EscapedChar / [^"])* '"')


RegularExpression
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


CurlyBrackets
  = "{" body:CurlyBracketsBody "}"
      { return body }

CurlyBracketsBody
  = $(CurlyBracketsBodyElement*)

CurlyBracketsBodyElement
  = BracketsBodyElement
  / CurlyBrackets
  / [^}]

RoundBrackets
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


Comment
  = MultiLineComment
  / SingleLineComment

MultiLineComment
  = "/*" (!"*/" .)* "*/"

SingleLineComment
 = "//" TextToEol

/* ===== Helper rules ===== */
_
  = WhiteSpace

__
  = WhitespaceMultiLine

EOL
  = _* LineTerminatorSequence

TextToEol
  = $(!LineTerminator .)*

JSIdentifier
  = $([a-zA-Z$_][a-zA-Z0-9$_]*)
