interface XJadeOptions {
	compile?: string;
	doctype?: string;
	locals?: any;
	pretty?: boolean;
	readFile?: (path:string)=>string;
}


interface XJadeCompiler {
	compile(filename: string, opts: XJadeOptions): string;
}


/**
	Simplified representation of Any XJadeNode.
	Specific node types will have different subset of listed fields.
*/
interface XJadeNode {
	type: string;
	name?;
	value?;
	insert?: boolean;
	children?: XJadeNode[];
	line?: number;
	column?: number;
}

interface XJadeTemplateNode extends XJadeNode {
	prefix: string;
	args: XJadeNode;
	body: XJadeNode;
}

interface XJadeTagNode extends XJadeNode {
	name: string;
	id: string;
	classes: string[];
	attributes: XJadeNode[];
}
