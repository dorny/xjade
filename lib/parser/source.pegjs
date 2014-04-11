/** XJade language grammar for use with PEG.js
    (c) Copyright 2014. Michal Dorner. All rights reserved.
**/


/* ===== Start ===== */

Start
  = nodes:(OuterCode/Template)*


OuterCode
  = value:$(OuterCodeElement+)
   {
     return {
       type: 'OuterCode',
       value: value,
       line: line(),
       column: column()
     };
   }

OuterCodeElement
   = Comment
   / StringLiteral
   / RegularExpression
   / !Template .


Template
  = "@template" __ name:JSIdentifier?
    __ ("("/UnexpectedToken) args:RoundBracketsBody (")"/Unmatched)
    __ ("{"/UnexpectedToken) body:TemplateBody ("}" / Unmatched)
  {
    return {
      type:"Template",
      name: name,
      args: args,
      body: body,
      line: line(),
      column: column(),
    };
  }


TemplateBody
  = code:CurlyBracketsBody
      {
        return {
          type: 'TemplateBody',
          value: code,
          line: line(),
          column: column() + 1
        };
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
  = Whitespace

__
  = WhitespaceMultiLine

EOL
  = _* LineTerminatorSequence

TextToEol
  = $(!LineTerminator .)*

JSIdentifier
  = $([a-zA-Z$_][a-zA-Z0-9$_]*)



/* ===== Error reporting ===== */

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

Unmatched
  = & {
    throw new SyntaxError('Unmatched parentheses', null, null, offset(), line(), column())
  }

UnexpectedToken
  = token:InvalidChars & {
      throw new SyntaxError('Unexpected token: '+token.text, null, token.text, token.offset, token.line, token.column);
    }
