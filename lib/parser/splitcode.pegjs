/* ===== Start ===== */

Start =
  part:(CodePart / El)*


El
  = "@el" &(![a-zA-Z0-9_$])
      { return {type: 'El'}; }


CodePart
  = code:$(StringLiteral / Comment / RegularExpression / !El .)+
      { return {type:'CodePart', value: code}; }

/* ===== Lexical Grammar ===== */

EscapedChar "Escaped character"
    = "\\" .

StringLiteral "String literal"
  = "'" (EscapedChar / [^'])* "'"
  / '"' $(EscapedChar / [^"])* '"'


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

LineTerminator "LineTerminator"
  = [\n\r\u2028\u2029]

/* ===== Comments ===== */

Comment "Comment"
  = MultiLineComment
  / SingleLineComment



MultiLineComment "Multiline Comment: /*...*/"
  = "/*" (!"*/" .)* "*/"

SingleLineComment "Single Line Comment // ..."
 = "//" (!LineTerminator .)*
