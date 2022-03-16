import fs from 'fs';

export const splitArgs = (args) => {
	return args.split(',');
};

export const resolveInput = (input) => {
	let text = input;
	if (fs.existsSync(input)) {
		try {
			text = fs.readFileSync(input, 'utf-8');
		} catch (err) {
			console.error(err);
		}
	}
	if (text[0] === "\\") {
		text = text.substring(1);
	}
	text = text.replace(/\\n/mg, '\n');
	return text;
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

export const intParseArgs = (args) => {
	for (let i = 0; i < args.length; i++) {
		args[i] = parseInt(args[i]);
	}
	return args;
};

const box = (text, indexes) => {
	const lines = linify(text);
	const start = {line: indexes[0] - 1, col: indexes[1] - 1};
	const end = {line: indexes[2] - 1, col: indexes[3] - 1};
	let out = [];
	for (let i = start.line; i < end.line; i++) {
		out.push(lines[i].substring(start.col, end.col));
	}
	return out;
};

const replaceAt = (string, pos, size, text) => {
	return string.substring(0, pos) + text + string.substring(pos + size, string.length);
};

const numEncodeMap = {
	'a': 1,
	'b': 2,
	'c': 3,
	'd': 4,
	'e': 5,
	'f': 6,
	'g': 7,
	'h': 8,
	'i': 9,
	'j': 10,
	'j': 11,
	'l': 12,
	'm': 13,
	'n': 14,
	'o': 15,
	'p': 16,
	'q': 17,
	'r': 18,
	's': 19,
	't': 20,
	'u': 21,
	'v': 22,
	'w': 23,
	'x': 24,
	'y': 25,
	'z': 26,
}
const numEncode = (string) => {
	const lower = string.toLowerCase();
	let out = [];
	for (let i = 0; i < lower.length; i++) {
		out.push(numEncodeMap[lower[i]]);
	}
	return out;
};

const numDecodeMap = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'j', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
const numDecode = (nums) => {
	let out = '';
	for (let i = 0; i < nums.length; i++) {
		out = out + (numDecodeMap[nums[i] - 1]);
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
				case 'title': {
					out = input.toLowerCase();
					const regex = /(\s|\.|\,)/mg;
					const matches = out.matchAll(regex);
					for (const match of matches) {
						if (match.index !== out.length - 1) {
							out = replaceAt(out, match.index + 1, 1, out[match.index + 1].toUpperCase());
						}
					}
					out = replaceAt(out, 0, 1, out[0].toUpperCase());
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
			if (argument === true) {
				let out = '';
				inputs.forEach((item) => {
					out = out + item;
				});
				return [out];
			} else {
				let out = [];
				inputs.forEach((input) => {
					out.push(input + resolveInput(argument));
				});
				return out;
			}
		},
		'multi'
	),
	'repeat': new Operator(
		'repeat',
		'Repeats a string a certain amount of times',
		(input, argument) => {
			const times = parseInt(argument);
			let out = '';
			for (let i = 0; i < times; i++) {
				out = out + input;
			}
			return out;
		},
		'single'
	),
	'sub': new Operator(
		'sub',
		'Obtains a substring of text',
		(input, argument) => {
			if (argument.includes(',')) {
				const args = splitArgs(argument);
				args = intParseArgs(args);
				return input.substring(args[0], args[1]);
			} else if (argument.includes('-')) {
				const args = argument.split('-');
				args = intParseArgs(args);
				return input.substring(args[0], args[0] + args[1]);
			} else {
				return input;
			}
		},
		'single'
	),
	'boxsub': new Operator(
		'boxsub',
		'Selects a substring using row and column indexes',
		(input, argument) => {
			if (argument.includes(',')) {
				const args = splitArgs(argument);
				args = intParseArgs(args);
				const selection = box(input, [args[0], args[1], args[2] + 1, args[3] + 1]);
				return textify(selection);
			} else if (argument.includes('-')) {
				const args = argument.split('-');
				args = intParseArgs(args);
				const selection = box(input, [args[0], args[1], args[0] + args[2], args[1] + args[3]]);
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
				const args = splitArgs(argument);
				args = intParseArgs(args);
				const lines = linify(input);
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
			const args = splitArgs(argument);
			const reg = new RegExp(resolveInput(args[0]), 'mg');
			return input.replace(reg, resolveInput(args[1]));
		},
		'single'
	),
	'weave': new Operator(
		'weave',
		'Interlaces multiple strings',
		(inputs, argument) => {
			const size = parseInt(argument);
			let out = '';
			let done = false;
			let i = 0;
			while (!done) {
				done = true;
				inputs.forEach((input) => {
					if (i + size >= input.length) {
						out = out + input.substring(i, input.length);
					} else {
						done = false;
						out = out + input.substring(i, size);
					}
				});
				i += size;
			}
			return [out];
		},
		'multi'
	),
	'shrink': new Operator(
		'shrink',
		'Removes characters from the beginning or end of text',
		(input, argument) => {
			const arg = parseInt(argument);
			if (arg < 0) {
				return input.substring(0, input.length + arg);
			} else {
				return input.substring(arg, input.length);
			}
		},
		'single'
	),
	'oneliner': new Operator(
		'oneliner',
		'Removes all newlines',
		(input, argument) => {
			console.log(argument);
			const arg = (argument === 'true');
			if (arg) {
				return input.replace(/\n/mg, ' ');
			} else {
				return input.replace(/\n/mg, '');
			}
		},
		'single'
	),
	'place': new Operator(
		'place',
		'Replaces text at a specified index',
		(input, argument) => {
			const args = splitArgs(argument);
			const index = parseInt(args[0]);
			const text = args[1];
			if (args.length >= 3) {
				return replaceAt(input, index, parseInt(args[2]), resolveInput(text));
			} else {
				return replaceAt(input, index, text.length, resolveInput(text));
			}
		},
		'single'
	),
	'yell': new Operator(
		'yell',
		'Repeats letters',
		(input, argument) => {
			let out = '';
			const size = parseInt(argument);
			for (let i = 0; i < input.length; i++) {
				if (input[i] == ' ') {
					out = out + input[i];
				} else {
					for (let j = 0; j < size; j++) {
						out = out + input[i];
					}
				}
			}
			return out;
		},
		'single'
	),
	'otp': new Operator(
		'otp',
		'One time pad cipher',
		(input, argument) => {
			const args = splitArgs(argument);
			const key = numEncode(resolveInput(args[0]));
			const encoded = numEncode(input);

			const wrap = (value) => {
				if (value > numDecodeMap.length) {
					return value - numDecodeMap.length;
				} else if (value <= 0) {
					return numDecodeMap.length + value;
				} else {
					return value;
				}
			};

			const mode = args[1];
			let out = [];
			for (let i = 0; i < encoded.length; i++) {
				if (i >= key.length) {
					out.push(encoded[i]);
				} else {
					if (mode === 'encode') {
						out.push(wrap(encoded[i] + key[i] - 1));
					} else {
						out.push(wrap(encoded[i] - key[i] + 1));
					}
				}
			}
			return numDecode(out);
		},
		'single'
	),
	'help': new Operator(
		'help',
		'Gives help info',
		(input, argument) => {
			try {
				const op = operators[argument];
				return op.name + ': ' + op.desc;
			} catch (err) {
				console.log(err);
				return "Operator does not exist!";
			}
		},
		'single'
	),
	'insert': new Operator(
		'insert',
		'Inserts text at a position in another string',
		(input, argument) => {
			const args = splitArgs(argument);
			const pos = parseInt(args[1]);
			return input.substring(0, pos) + resolveInput(args[0]) + input.substring(pos, input.length);
		},
		'single'
	)
}