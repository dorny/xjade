function quote(str) {
    return "'" + exports.escape(str).replace(/'/gm, "\\'") + "'";
}
exports.quote = quote;

function escape(str) {
    return str.replace(/\n/gm, '\\n').replace(/\r/gm, '\\r').replace(/\t/gm, '\\t').replace(/\u2028/gm, '\u2028').replace(/\u2029/gm, '\u2029');
}
exports.escape = escape;
