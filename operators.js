import fs from 'fs';

export const emptyIdentifier = 'CTEXT_EMPTY'

/* Splits comma-separated arguments into an array */
export const splitArgs = (args) => {
	return args.split(',');
};

/* Parses an input and retrieves contents of a file if specified */
export const parseInput = (input) => {
	let text = input;
	if (text === undefined || text === emptyIdentifier) return '';
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

export const operatorAliases = {
	'len': 'length',
	'rep': 'replace',
	'sub': 'substring',
	'rev': 'reverse',
	'cat': 'append',
	'concatenate': 'append',
	'rep': 'repeat',
	'rpl': 'replace',
	'dup': 'duplicate',
	'ins': 'insert',
	'del': 'erase',
	'ers': 'erase',
	'abr': 'abbreviate',
	'abbr': 'abbreviate',
	'put': 'place'
};

/* Converts text to an array of lines */
const linify = (text) => {
	return text.split('\n');
};

/* Converts text lines back into a single string */
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


const specificIndexOf = (string, regex, pos) => {
	const matches = string.matchAll(regex);
	let positions = [];
	for (const match of matches) {
		positions.push(match.index);
	}
	return positions[pos];
};

/* Parses a single integer argument */
const parseIntArg = (argument, input) => {
	if (argument[0] === 'w') {
		const wordPos = parseInt(argument.substring(1, argument.length));
		let index = specificIndexOf(input, /\s/mg, wordPos - 1);
		if (index === undefined) index = 0;
		return index;
	} else {
		return parseInt(argument);
	}
};

/* Parses arguments as integers */
export const intParseArgs = (args, input) => {
	let out = [];
	args.forEach((arg) => {
		out.push(parseIntArg(arg, input));
	});
	return out;
};

/* Obtains a box substring of text */
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

/* Replaces text at a position in a string */
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
/* Encodes text to an array of numbers */
const numEncode = (string) => {
	const lower = string.toLowerCase();
	let out = [];
	for (let i = 0; i < lower.length; i++) {
		out.push(numEncodeMap[lower[i]]);
	}
	return out;
};

const numDecodeMap = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'j', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
/* Decodes number-encoded text */
const numDecode = (nums) => {
	let out = '';
	for (let i = 0; i < nums.length; i++) {
		out = out + (numDecodeMap[nums[i] - 1]);
	}
	return out;
};

/* Defines an operator */
export class Operator {
	constructor(name, desc, fun, type) {
		this.name = name;
		this.desc = desc;
		this.fun = fun;
		this.type = type;
	}
}

/* The list of operators available */
export const operators = {
	'reverse': new Operator(
		'reverse',
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
	'join': new Operator(
		'join',
		'Joins multiple text strings',
		(inputs, argument) => {
			const arg = parseInput(argument);
			return [inputs.join(arg)];
		},
		'multi'
	),
	'append': new Operator(
		'append',
		'Appends a string to another',
		(input, argument) => {
			return input + parseInput(argument);
		},
		'single'
	),
	'repeat': new Operator(
		'repeat',
		'Repeats a string a certain amount of times',
		(input, argument) => {
			const times = parseIntArg(argument, input);
			let out = '';
			for (let i = 0; i < times; i++) {
				out = out + input;
			}
			return out;
		},
		'single'
	),
	'substring': new Operator(
		'substring',
		'Obtains a substring of text',
		(input, argument) => {
			if (argument.includes(',')) {
				let args = splitArgs(argument);
				args = intParseArgs(args, input);
				return input.substring(args[0], args[1]);
			} else if (argument.includes('-')) {
				let args = argument.split('-');
				args = intParseArgs(args, input);
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
				let args = splitArgs(argument);
				args = intParseArgs(args, input);
				const selection = box(input, [args[0], args[1], args[2] + 1, args[3] + 1]);
				return textify(selection);
			} else if (argument.includes('-')) {
				let args = argument.split('-');
				args = intParseArgs(args, input);
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
				args = intParseArgs(args, input);
				const lines = linify(input);
				return lines[args[0] - 1][args[1] - 1];
			} else {
				return input[parseIntArg(argument, input)];
			}
		},
		'single'
	),
	'replace': new Operator(
		'replace',
		'Replaces occurences of a string with another one',
		(input, argument) => {
			const args = splitArgs(argument);
			const reg = new RegExp(parseInput(args[0]), 'mg');
			return input.replace(reg, parseInput(args[1]));
		},
		'single'
	),
	'weave': new Operator(
		'weave',
		'Interlaces multiple strings',
		(inputs, argument) => {
			const size = parseIntArg(argument, input);
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
			const arg = parseIntArg(argument, input);
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
			const arg = (argument === 'CTEXT_EMPTY');
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
			const index = parseIntArg(args[0], input);
			const text = args[1];
			if (args.length >= 3) {
				return replaceAt(input, index, parseIntArg(args[2], input), parseInput(text));
			} else {
				return replaceAt(input, index, text.length, parseInput(text));
			}
		},
		'single'
	),
	'yell': new Operator(
		'yell',
		'Repeats letters',
		(input, argument) => {
			let out = '';
			const size = parseIntArg(argument, input);
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
			const key = numEncode(parseInput(args[0]));
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
			const pos = parseIntArg(args[1], input);
			return input.substring(0, pos) + parseInput(args[0]) + input.substring(pos, input.length);
		},
		'single'
	),
	'squash': new Operator(
		'squash',
		'Removes repeated characters',
		(input, argument) => {
			let out = '';
			for (let i = 0; i < input.length; i++) {
				if (i !== 0) {
					if (input[i] != input[i - 1]) {
						out = out + input[i];
					}
				} else {
					out = out + input[i];
				}
			}
			return out;
		},
		'single'
	),
	'abbreviate': new Operator(
		'abbreviate',
		'Abbreviates a series of words',
		(input, argument) => {
			const split = input.toUpperCase().split(' ');
			let out = '';
			split.forEach((word) => {
				out = out + word[0];
			});
			return out;
		},
		'single'
	),
	'duplicate': new Operator(
		'duplicate',
		'Duplicates a single input into multiple of the same',
		(input, argument) => {
			const times = parseIntArg(argument, input);
			let array = [];
			for (let i = 0; i < times; i++) {
				array.push(input);
			}
			return array;
		},
		'single'
	),
	'split': new Operator(
		'split',
		'Splits a string into multiple values based on a delimiter',
		(input, argument) => {
			const split = input.split(parseInput(argument));
			return split;
		},
		'single'
	),
	'erase': new Operator(
		'erase',
		'Removes part of a string',
		(input, argument) => {
			if (argument.includes(',')) {
				let args = splitArgs(argument);
				args = intParseArgs(args, input);
				return replaceAt(input, args[0], args[1] - args[0], '');
			} else if (argument.includes('-')) {
				let args = argument.split('-');
				args = intParseArgs(args, input);
				return replaceAt(input, args[0], args[1], '');
			} else {
				const arg = parseIntArg(argument, input);
				let endPos = input.substring(arg + 1, input.length).indexOf(' ');
				if (endPos === -1) endPos = input.length;
				return replaceAt(input, arg, endPos + 1, '');
			}
		},
		'single'
	),
	'length': new Operator(
		'length',
		'Obtains the length of a string, including any whitespace',
		(input, argument) => {
			return toString(input.length);
		},
		'single'
	),
	'characters': new Operator(
		'characters',
		'Counts the number of non-whitespace characters in a string',
		(input, argument) => {
			const remove = input.replace(/\s/mg, '');
			return toString(remove.length);
		},
		'single'
	),
	'filter': new Operator(
		'filter',
		'Filters lines that follow a criteria',
		(input, argument) => {
			const split = input.split('\n');
			const args = splitArgs(argument);
			let out = '';
			switch (parseInput(args[0])) {
				case 'has': {
					const search = parseInput(args[1]);
					out = split.filter((line) => {
						return (line.indexOf(search) !== -1);
					});
					break;
				}
			}
			return out.join('\n');
		},
		'single'
	)
}