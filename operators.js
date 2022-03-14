var inputList = [];

const splitArgs = (args) => {
	return args.split(',');
};

const linify = (text) => {
	return text.split('\n');
};

const textify = (lines) => {
	let out = '';
	lines.forEach((line, i) => {
		out = out + line;
		if (i < lines.length - 1) {
			out = out + '\n';
		}
	});
	return out;
};

const intParseArgs = (args) => {
	for (let i = 0; i < args.length; i++) {
		args[i] = parseInt(args[i]);
	}
	return args;
};

const box = (text, indexes) => {
	let lines = linify(text);
	let start = {line: indexes[0] - 1, col: indexes[1] - 1};
	let end = {line: indexes[2] - 1, col: indexes[3] - 1};
	let out = [];
	for (let i = start.line; i < end.line; i++) {
		out.push(lines[i].substring(start.col, end.col));
	}
	return out;
};

export class Operator {
	constructor(name, desc, fun, type) {
		this.name = name;
		this.desc = desc;
		this.fun = fun;
		this.type = type;
	}
}
export const operators = {
	'rev': new Operator(
		'rev',
		'Reverses text direction',
		(input, argument) => {
			let out = '';
			for (let i = input.length - 1; i > -1; i--) {
				out = out + input[i];
			}
			return out;
		},
		'single'
	),
	'case': new Operator(
		'case',
		'Changes the capitalization of text',
		(input, argument) => {
			let out = '';
			switch (argument) {
				case 'upper': {
					out = input.toUpperCase();
					break;
				}
				case 'lower': {
					out = input.toLowerCase();
					break;
				}
			}
			return out;
		},
		'single'
	),
	'cat': new Operator(
		'cat',
		'Joins multiple text strings',
		(inputs, argument) => {
			let out = '';
			inputs.forEach((item) => {
				out = out + item;
			});
			return [out];
		},
		'multi'
	),
	'repeat': new Operator(
		'repeat',
		'Repeats a string a certain amount of times',
		(input, argument) => {
			let times = parseInt(argument);
			let out = '';
			for (let i = 0; i < times; i++) {
				out = out + input;
			}
			return out;
		},
		'single'
	),
	'select': new Operator(
		'select',
		'Obtains a substring of text',
		(input, argument) => {
			if (argument.includes(',')) {
				let args = splitArgs(argument);
				args = intParseArgs(args);
				return input.substring(args[0], args[1]);
			} else if (argument.includes('-')) {
				let args = argument.split('-');
				args = intParseArgs(args);
				return input.substring(args[0], args[0] + args[1]);
			} else {
				return input;
			}
		},
		'single'
	),
	'selectbox': new Operator(
		'selectbox',
		'Selects a substring using row and column indexes',
		(input, argument) => {
			if (argument.includes(',')) {
				let args = splitArgs(argument);
				args = intParseArgs(args);
				let selection = box(input, [args[0], args[1], args[2] + 1, args[3] + 1]);
				return textify(selection);
			} else if (argument.includes('-')) {
				let args = argument.split('-');
				args = intParseArgs(args);
				let selection = box(input, [args[0], args[1], args[0] + args[2], args[1] + args[3]]);
				return textify(selection);
			} else {
				return input;
			}
		},
		'single'
	),
	'at': new Operator(
		'at',
		'Obtains the character at a position',
		(input, argument) => {
			if (input.includes(',')) {
				let args = splitArgs(argument);
				args = intParseArgs(args);
				let lines = linify(input);
				return lines[args[0] - 1][args[1] - 1];
			} else {
				return input[parseInt(argument)];
			}
		},
		'single'
	),
	'rep': new Operator(
		'rep',
		'Replaces occurences of a string with another one',
		(input, argument) => {
			let args = splitArgs(argument);
			let reg = new RegExp(args[0], 'mg');
			return input.replace(reg, args[1]);
		},
		'single'
	),
	'weave': new Operator(
		'weave',
		'Interlaces multiple strings',
		(inputs, argument) => {

		},
		'multi'
	),
	'shrink': new Operator(
		'shrink',
		'Removes characters from the beginning or end of text',
		(input, argument) => {
			let arg = parseInt(argument);
			if (arg < 0) {
				return input.substring(0, input.length + arg);
			} else {
				return input.substring(arg, input.length);
			}
		},
		'single'
	)
}