/// <reference path="d.ts/app.d.ts" />

var path = require('path');

function inspect(error) {
    require('util').inspect(error);
}

export class CustomError {

    _message: string
    public error;

    constructor(message: string, error?) {
        this._message = message;
        if (error==null)
            this.error = new Error(message);
        else
            this.error = error;
    }

    public toString() {
        return this._message;
    }

    public get stack() {
        return this.error.stack;
    }

    public get message() {
        return this.toString()
    }

    static stringify(error) {
        if (error.message) {
            return error.message;
        }
        else if (typeof error==='string') {
            return error;
        }
        else {
            return require('util').inspect(error);
        }
    }
}


export class IOError extends CustomError {
    constructor(error) {
        super(CustomError.stringify(error),error);
    }
}


export class ParserError extends CustomError {

    public filename: string;
    public name: string;
    public line: number;
    public column: number;

    constructor(name: string, message: string, filename: string, line: number, column: number, error?) {
        super(message,error);
        this.name = name;
        this.filename = filename;
        this.line = line;
        this.column = column;
    }

    public toString() {
         return  this.filename+':'+this.line+':'+this.column+': '+this.name+': '+this._message;
    }
}


export class ICError extends CustomError {

    public filename: string;
    public line: number;
    public column: number;

    constructor(message: string, filename: string, line?: number, column?: number, error?) {
        super(message, error);
        this.filename = filename;
        this.line = line;
        this.column = column;
    }

    static wrap(error, filename) {
        var message = CustomError.stringify(error);
        return new ICError(message, filename, null, null, error);
    }

    public toString() {
        var text = [this.filename,this.line,this.column].filter((val)=> val!=null).join(':')
        text+=': '+'ICE: '+this._message;

        if (this.stack) {
            text+='\n'+ this.stack;
        }

        return text;
    }
}


export class RuntimeError extends CustomError {

    public filename: string;
    public source: string;
    public line: number;
    public column: number;

    constructor(error, filename?: string, source?: string, line?: number, column?: number) {
        super(CustomError.stringify(error), error);
        this.filename = filename;
        this.source = source;
        this.line = line;
        this.column = column;
    }

    public toString() {

        var text = '';
        if (this.filename) {
            text += this.filename+': ';
        }

        text += 'RuntimeError: ' + this._message;

        if (this.source) {
            var lines = this.source.split('\n');
            var start = Math.max(this.line -7,0);
            var end = Math.min(this.line+2, lines.length-1);

            var src = lines.slice(start, end)
                .map((ln,i)=> { return (i+start+1===this.line ? '>':' ') + '   '+ln})
                .join('\n');

            text += '\n'+src;
        }

        if (this.stack)
            text += '\n\nStack: '+this.stack;

        return text;
    }

    public static match(stack) {
        var line = stack.slice(stack.indexOf('\n')+1);
        line = line.slice(0,line.indexOf('\n'));

        var m;
        if (line[line.length-1]===')')
            m = line.match(/^\s*at\s+.*?\((.+):(\d+):(\d+)\)$/);
        else
            m = line.match(/^\s*at\s+(.+):(\d+):(\d+)$/);

        if (m) {
            return {
                filename: m[1],
                line: parseInt(m[2],10),
                column: parseInt(m[3],10),
            };
        }
        else
            return null;
    }

}
