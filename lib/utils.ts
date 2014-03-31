export function quote(str: string) {
    return "'" +escape(str).replace(/'/gm, "\\'") + "'";
}

export function escape(str: string) {
    return str.replace(/\n/gm,'\\n')
        .replace(/\r/gm,'\\r')
        .replace(/\t/gm,'\\t')
        .replace(/\u2028/gm,'\u2028')
        .replace(/\u2029/gm,'\u2029');
}
