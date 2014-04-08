/// <reference path="lib.d.ts" />
/// <reference path="node.d.ts" />


interface XJadeOptions {
	compile?: string;
	doctype?: string;
	data?: any;
	pretty?: boolean;
	readFile?: (path:string)=>string;
}


interface XJadeCompiler {
	compile(filename: string, opts: XJadeOptions): string;
}



///////////////////////////////////////////////
//
//	XJadeNodes
//
///////////////////////////////////////////////

interface XJadeNode {
	type: string;
	line?: number;
	column?: number;
}

interface XJadeValueNode extends XJadeNode {
	value;
}

interface XJadeTemplateNode extends XJadeNode {
	name: string;
	args: string;
	body: XJadeValueNode;
}

interface XJadeTagNode extends XJadeNode {
	name: string;
	id?: string;
	classes: string[];
	conditionalClasses: XJadeTagAttribute[];
	attributes: XJadeTagAttribute[];
	children: XJadeNode[];
}

interface XJadeTagAttribute extends XJadeNode {
	name: string;
	value?: XJadeValueNode;
}

interface XJadeCommentNode extends XJadeValueNode {
	insert: boolean;
}


