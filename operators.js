import chalk from 'chalk';
import fs from 'fs';

export const emptyIdentifier = 'CTEXT_EMPTY';
export const removeIdentifier = 'CTEXT_REMOVE';

/* Splits comma-separated arguments into an array */
export const splitArgs = (args) => {
	return args.split(',');
};

/* Parses an input and retrieves contents of a file if specified */
export const parseInput = (input) => {
	let text = input.toString();
	if (text === undefined || text === emptyIdentifier) return '';
	if (fs.existsSync(input)) {
		try {
			text = fs.readFileSync(input, 'utf-8');
		} catch (err) {
			console.error(err);
		}
	} else {
		text = text.replace(/\\n/mg, '\n');
		if (text[0] === "\\") {
			text = text.substring(1);
		}
	}
	return text;
};

const operatorAliases = {
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
	'put': 'place',
	'yell': 'stretch'
};

/* Replaces an operator alias with the correct name */
export const replaceAlias = (name) => {
	if (Object.keys(operatorAliases).includes(name)) {
		return operatorAliases[name];
	} else {
		return name;
	}
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

/* Gets the index of a specific occurence of a search term in a string */
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
	if (argument === undefined || argument === emptyIdentifier) return 0; 
	if (argument[0] === 'w') {
		const wordPos = parseInt(argument.substring(1));
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
	const start = {row: indexes[0] - 1, col: indexes[1] - 1};
	const end = {row: indexes[2] - 1, col: indexes[3] - 1};
	let out = [];
	for (let i = start.row; i < end.row; i++) {
		out.push(lines[i].substring(start.col, end.col));
	}
	return out;
};

/* Replaces text at a position in a string */
const replaceAt = (string, pos, size, text) => {
	return string.substring(0, pos) + text + string.substring(pos + size);
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

/* Wraps a character number if it is too big or small */
const wrapNum = (value) => {
	if (value > numDecodeMap.length) {
		return value - numDecodeMap.length;
	} else if (value <= 0) {
		return numDecodeMap.length + value;
	} else {
		return value;
	}
};

/* Sets a default value for an argument */
const defaultValue = (arg, normal) => {
	if (arg === undefined || arg === emptyIdentifier || arg === '') {
		return normal;
	} else {
		return arg;
	}
};

const normalizeSpacing = (text, delimiter) => {
	text = text.replace(/(\.|\-|\_| )/mg, delimiter);
//	text = text.replace(new RegExp(' ', 'mg'), delimiter);
	const matches = text.matchAll(/[A-Z]/mg);

	const delimiters = [
		' ',
		'_',
		'.',
		'-'
	];

	let i = 0;
	for (const match of matches) {
		if (match.index !== 0) {
			const realIndex = match.index + i;
			if (!delimiters.includes(text[realIndex - 1])) {
				text = replaceAt(text, realIndex, 0, delimiter);
				i++;
			}
		}
	}
	text = text.toLowerCase();
	return text;
};

const caseTitle = (text) => {
	text = text.toLowerCase();
	const regex = /\W/mg;
	const matches = text.matchAll(regex);
	for (const match of matches) {
		if (match.index !== text.length - 1) {
			text = replaceAt(text, match.index + 1, 1, text[match.index + 1].toUpperCase());
		}
	}
	return replaceAt(text, 0, 1, text[0].toUpperCase());
};

/* Defines an operator */
export class Operator {
	constructor(name, desc, fun, type) {
		this.name = name;
		this.desc = desc;
		this.fun = fun;
		this.type = type;
		this.parameters = {};
	}
	addParameters(parameters) {
		this.parameters = parameters;
		return this;
	}
}

/* The list of operators available */
export const operators = {
	'reverse': new Operator(
		'reverse',
		'Reverses text direction. \nUsage: reverse',
		(input, argument, inputIndex) => {
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
		'Changes the capitalization of text. \nUsage: case type',
		(input, argument, inputIndex) => {
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
				case 'snake': {
					out = normalizeSpacing(input, '_');
					break;
				}
				case 'dot': {
					out = normalizeSpacing(input, '.');
					break;
				}
				case 'dash': {
					out = normalizeSpacing(input, '-');
					break;
				}
				case 'constant': {
					out = normalizeSpacing(input, '_').toUpperCase();
					break;
				}
				case 'title': {
					out = caseTitle(input);
					break;
				}
				case 'camel': {
					out = normalizeSpacing(input, ' ');
					out = caseTitle(out);
					out = out.replace(/ /mg, '');
					out = replaceAt(out, 0, 1, out[0].toLowerCase());
					break;
				}
				case 'pascal': {
					out = normalizeSpacing(input, ' ');
					out = caseTitle(out);
					out = out.replace(/ /mg, '');
					break;
				}
			}
			return out;
		},
		'single'
	).addParameters({
		'type': 'The capitalization to change to. Can be one of upper, lower, title, snake, dot, dash, constant, camel, or pascal'
	}),
	'join': new Operator(
		'join',
		'Joins multiple text strings. \nUsage: join delimiter',
		(inputs, argument) => {
			const arg = parseInput(argument);
			return [inputs.join(arg)];
		},
		'multi'
	).addParameters({
		'delimiter': 'A string to put between each value when they are joined'
	}),
	'append': new Operator(
		'append',
		'Appends a string to another. \nUsage: append text',
		(input, argument, inputIndex) => {
			return input + parseInput(argument);
		},
		'single'
	).addParameters({
		'text': 'The text to appened to the end of the string'
	}),
	'repeat': new Operator(
		'repeat',
		'Repeats a string a certain amount of times. \nUsage: repeat times,[delimiter]',
		(input, argument, inputIndex) => {
			console.log(argument);
			const args = splitArgs(argument);
			const times = parseIntArg(args[0], input);
			const delimiter = defaultValue(parseInput(args[1]), '');
			let out = '';
			for (let i = 0; i < times; i++) {
				if (i === times - 1) {
					out = out + input;
				} else {
					out = out + input + delimiter;
				}
			}
			return out;
		},
		'single'
	).addParameters({
		'times': 'The number of times to repeat the string',
		'[delimiter]': 'A string to add between each repeated value'
	}),
	'substring': new Operator(
		'substring',
		'Obtains a substring of text. \nUsage: substring start,end OR start-end',
		(input, argument, inputIndex) => {
			if (argument.includes(',')) {
				const args = intParseArgs(splitArgs(argument), input);
				return input.substring(args[0], args[1]);
			} else if (argument.includes('-')) {
				const args = intParseArgs(argument.split('-'), input);
				return input.substring(args[0], args[0] + args[1]);
			} else if (argument !== emptyIdentifier) {
				const arg = parseIntArg(argument, input);
				return input.substring(arg);
			} else {
				return input;
			}
		},
		'single'
	).addParameters({
		'start': 'Where to begin the substring',
		'end': 'Where to end the substring. If the arguments ae separated by a hyphen, will use relative positioning'
	}),
	'boxsub': new Operator(
		'boxsub',
		'Selects a substring using row and column indexes. \nUsage: boxsub startrow,startcol,endrow,endcol OR startrow-startcol-endrow-endcol',
		(input, argument, inputIndex) => {
			if (argument.includes(',')) {
				const args = intParseArgs(splitArgs(argument), input);
				const selection = box(input, [args[0], args[1], args[2] + 1, args[3] + 1]);
				return textify(selection);
			} else if (argument.includes('-')) {
				const args = intParseArgs(argument.split('-'), input);
				const selection = box(input, [args[0], args[1], args[0] + args[2], args[1] + args[3]]);
				return textify(selection);
			} else {
				return input;
			}
		},
		'single'
	).addParameters({
		'startrow': 'The row to begin the substring at',
		'startcol': 'The column to begin the substring at',
		'endrow': 'The row to end the substring at. If a hyphen is used to separate the arguments, will use relative positioning',
		'endrow': 'The column to end the substring at. If a hyphen is used to separate the arguments, will use relative positioning'
	}),
	'at': new Operator(
		'at',
		'Obtains the character at a position. \nUsage: at position OR at row-col',
		(input, argument, inputIndex) => {
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
	).addParameters({
		'position': 'Where to obtain the character from',
		'row': 'The row to obtain the character from',
		'col': 'The column to obtain the character from'
	}),
	'replace': new Operator(
		'replace',
		'Replaces occurences of a string with another one. \nUsage: replace search,new',
		(input, argument, inputIndex) => {
			const args = splitArgs(argument);
			const reg = new RegExp(parseInput(args[0]), 'mg');
			return input.replace(reg, parseInput(args[1]));
		},
		'single'
	).addParameters({
		'search': 'The string to search for',
		'new': 'The string to replace the matches with'
	}),
	'weave': new Operator(
		'weave',
		'Interlaces multiple strings. \nUsage: weave size1,size2...',
		(inputs, argument) => {
			const args = splitArgs(argument);
			let sizes = [];
			inputs.forEach((input, index) => {
				let size = args[index];
				if (size === undefined) {
					if (index === 0) {
						size = 0;
					} else {
						size = sizes[i - 1];
					}
				} else {
					size = parseIntArg(size, input);
				}
				sizes.push(size);
			});
			let out = '';
			let done = false;
			let positions = [];
			for (let i = 0; i < sizes.length; i++) {
				positions.push(0);
			}
			while (!done) {
				done = true;
				inputs.forEach((input, i) => {
					const pos = positions[i];
					const size = sizes[i];
					if (pos + size >= input.length) {
						out = out + input.substring(pos);
					} else {
						done = false;
						out = out + input.substring(pos, size);
					}
					positions[i] += size;
				});
			}
			return [out];
		},
		'multi'
	).addParameters({
		'size#': 'The interval at which to slice the input at the same index'
	}),
	'shrink': new Operator(
		'shrink',
		'Removes characters from the beginning or end of text. \nUsage: shrink amount',
		(input, argument, inputIndex) => {
			const arg = parseIntArg(argument, input);
			if (arg < 0) {
				return input.substring(0, input.length + arg);
			} else {
				return input.substring(arg);
			}
		},
		'single'
	).addParameters({
		'amount': 'The number of characters to shrink the string by. Use a negative number in quotes to shrink from the end of the string'
	}),
	'oneliner': new Operator(
		'oneliner',
		'Removes all newlines. \nUsage: oneliner [separate]',
		(input, argument, inputIndex) => {
			const arg = (argument !== emptyIdentifier);
			if (arg) {
				return input.replace(/\n/mg, ' ');
			} else {
				return input.replace(/\n/mg, '');
			}
		},
		'single'
	).addParameters({
		'[separate]': 'Whether or not to add a space to separate each line'
	}),
	'place': new Operator(
		'place',
		'Replaces text at a specified index. \nUsage: place position,text',
		(input, argument, inputIndex) => {
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
	).addParameters({
		'position': 'Where to put the text',
		'text': 'The text to place over the string'
	}),
	'stretch': new Operator(
		'stretch',
		'Repeats letters. \nUsage: stretch amount',
		(input, argument, inputIndex) => {
			let out = '';
			const size = parseIntArg(argument, input);
			for (let i = 0; i < input.length; i++) {
				if (input[i] === ' ') {
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
	).addParameters({
		'amount': 'How many characters to stretch by'
	}),
	'otp': new Operator(
		'otp',
		'One time pad cipher. \nUsage: key,mode',
		(input, argument, inputIndex) => {
			const args = splitArgs(argument);
			const key = numEncode(parseInput(args[0]));
			const encoded = numEncode(input);

			const mode = args[1];
			let out = [];
			for (let i = 0; i < encoded.length; i++) {
				if (i >= key.length) {
					out.push(encoded[i]);
				} else {
					if (mode === 'encode') {
						out.push(wrapNum(encoded[i] + key[i] - 1));
					} else {
						out.push(wrapNum(encoded[i] - key[i] + 1));
					}
				}
			}
			return numDecode(out);
		},
		'single'
	).addParameters({
		'key': 'The key to use to encode or decode your text. Should be as long or longer than your text',
		'mode': 'The mode for the cipher, either encode or decode'
	}),
	'help': new Operator(
		'help',
		'Gives help info. \nUsage: help [operator]',
		(input, argument, inputIndex) => {
			if (argument === emptyIdentifier) {
				let out = [];
				for (let i = 0; i < Object.keys(operators).length; i++) {
					out.push(`${Object.keys(operators)[i]} - ${Object.values(operators)[i].desc}`);
				}
				console.log(out.join('\n'));
				return input;
			} else {
				const op = operators[replaceAlias(argument)];
				if (op === undefined) {
					console.log("Operator does not exist!");
				} else {
					console.log(`${op.name}: ${op.desc}`);
					for (let i = 0; i < Object.keys(op.parameters).length; i++) {
						console.log(`${Object.keys(op.parameters)[i]}: ${Object.values(op.parameters)[i]}`)
					}
				}
				return input;
			}
		},
		'single'
	).addParameters({
		'[operator]': 'The operator to get info about. If left out, will list all avaliable operators'
	}),
	'insert': new Operator(
		'insert',
		'Inserts text at a position in another string. \nUsage: insert text,position',
		(input, argument, inputIndex) => {
			const args = splitArgs(argument);
			const pos = parseIntArg(args[1], input);
			return input.substring(0, pos) + parseInput(args[0]) + input.substring(pos);
		},
		'single'
	).addParameters({
		'text': 'The text to insert',
		'position': 'where to insert the text'
	}),
	'squash': new Operator(
		'squash',
		'Removes repeated characters. \nUsage: squash',
		(input, argument, inputIndex) => {
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
		'Abbreviates a series of words. \nUsage: abbreviate',
		(input, argument, inputIndex) => {
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
		'Duplicates a single input into multiple of the same. \nUsage: duplicate times',
		(input, argument, inputIndex) => {
			const times = parseIntArg(argument, input);
			let array = [];
			for (let i = 0; i < times; i++) {
				array.push(input);
			}
			return array;
		},
		'single'
	).addParameters({
		'times': 'How many times to duplicate the value'
	}),
	'split': new Operator(
		'split',
		'Splits a string into multiple values based on a delimiter. \nUsage: split delimiter',
		(input, argument, inputIndex) => {
			const split = input.split(parseInput(argument));
			return split;
		},
		'single'
	).addParameters({
		'delimiter': 'What to split the string on. Will not be included in the final string'
	}),
	'erase': new Operator(
		'erase',
		'Removes part of a string. \nUsage: erase start,end OR erase start-end',
		(input, argument, inputIndex) => {
			if (argument.includes(',')) {
				const args = intParseArgs(splitArgs(argument), input);
				return replaceAt(input, args[0], args[1] - args[0], '');
			} else if (argument.includes('-')) {
				const args = intParseArgs(argument.split('-'), input);
				return replaceAt(input, args[0], args[1], '');
			} else {
				const arg = parseIntArg(argument, input);
				let endPos = input.substring(arg + 1).indexOf(' ');
				if (endPos === -1) endPos = input.length;
				return replaceAt(input, arg, endPos + 1, '');
			}
		},
		'single'
	).addParameters({
		'start': 'The position to begin erasing at',
		'end': 'The position to end erasing. If a hyphen is used to separate the arguments, will use relative positioning'
	}),
	'length': new Operator(
		'length',
		'Obtains the length of a string, including any whitespace. \nUsage: length',
		(input, argument, inputIndex) => {
			return input.length.toString();
		},
		'single'
	),
	'characters': new Operator(
		'characters',
		'Counts the number of non-whitespace characters in a string. \nUsage: characters',
		(input, argument, inputIndex) => {
			const remove = input.replace(/\s/mg, '');
			return remove.length.toString();
		},
		'single'
	),
	'filter': new Operator(
		'filter',
		'Filters lines that follow a criteria. \nUsage: filter mode, criteria',
		(input, argument, inputIndex) => {
			const split = input.split('\n');
			const args = splitArgs(argument);
			let out = [];
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
	).addParameters({
		'mode': 'The type of filtering to do. "has" mode will filter lines that contain a string',
		'criteria': 'The condition to match for'
	}),
	'sort': new Operator(
		'sort',
		'Sorts lines based on a criteria',
		(input, argument, inputIndex) => {
			const split = input.split('\n');
			const args = splitArgs(argument);

			const sortAlphabetically = (lines) => {
				
			};

			let out = [];
			switch (parseInput(args[0])) {
				case 'az': {
					
					break;
				}
			}
			return out.join('\n');
		},
		'single'
	),
	'cshift': new Operator(
		'cshift',
		'Caesar\'s shift cipher. \nUsage: cshift offset',
		(input, argument, inputIndex) => {
			const amount = parseIntArg(argument);
			const encode = numEncode(input);
			let out = [];
			encode.forEach((char) => {
				out.push(wrapNum(char + amount));
			});
			return numDecode(out);
		},
		'single'
	).addParameters({
		'offset': 'How many characters to shift the letters by'
	}),
	'unshift': new Operator(
		'unshift',
		'A tool to help with deciphering a caesarian shift. \nUsage: unshift',
		(input, argument, inputIndex) => {
			console.log(input);
			let out = '';
			for (let i = 0; i < numDecodeMap.length; i++) {
				out = out + operators['cshift'].fun(input, i.toString()) + '\n';
			}
			return out;
		},
		'single'
	),
	'find': new Operator(
		'find',
		'Finds occurences of a string',
		(input, argument, inputIndex) => {

		}
	),
	'linenumbers': new Operator(
		'linenumbers',
		'Adds line numbers to text. \nUsage: linenumbers start',
		(input, argument, inputIndex) => {
			const split = input.split('\n');
			const offset = parseIntArg(argument, input);
			const length = split.length + offset;
			const size = length.toString().length;
			let out = '';
			split.forEach((line, index) => {
				const number = operators['pad'].fun((index + offset).toString(), size.toString() + ', ') + ' ';
				if (index === split.length - 1) {
					out = out + number + line;
				} else {
					out = out + number + line + '\n';
				}
			});
			return out;
		},
		'single'
	).addParameters({
		'start': 'The number to start on'
	}),
	'pad': new Operator(
		'pad',
		'Adds characters to a string to make it reach a certain length. \nUsage: pad length,character',
		(input, argument, inputIndex) => {
			const args = splitArgs(argument);
			const length = parseIntArg(args[0], input);
			const character = parseInput(args[1]);
			if (character.length > 1 || input.length >= length) {
				return input;
			} else {
				let out = input;
				const difference = length - input.length;
				for (let i = 0; i < difference; i++) {
					out = out + character;
				}
				return out;
			}
		},
		'single'
	).addParameters({
		'length': 'The length to pad to',
		'character': 'The character used to pad the string to size'
	}),
	'toss': new Operator(
		'toss',
		'Inserts a set of strings at random positions in another string. \nUsage: toss amount,item1,item2...',
		(input, argument, inputIndex) => {
			let args = splitArgs(argument);
			const times = parseIntArg(args[0], input);
			args.splice(0, 1);
			let out = input;
			for (let i = 0; i < times; i++) {
				const choice = Math.floor(Math.random() * args.length);
				const pos = Math.floor(Math.random() * out.length);
				out = replaceAt(out, pos, 0, args[choice]);
			}
			return out;
		},
		'single'
	).addParameters({
		'amount': 'The number of times to place items in the string',
		'item#': 'A string that has a chance to be tossed into the output'
	}),
	'numwords': new Operator(
		'numwords',
		'Converts a number to an english word equivalent. \nUsage: numwords [individual]',
		(input, argument, inputIndex) => {
			const zero = 'zero';
			const singles = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
			const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
			const doubles = ['twenty', 'thirty', 'fourty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
			const bigs = [
				'hundred', 'thousand', 
				'million', 'billion', 'trillion', 'quadillion', 'quintillion', 'sextillion', 'septillion', 'octillion', 'nonillion', 'decillion',
				'undecillion'
			];
			const partSeparator = 'and';
			
			const clean = input.replace(',', '');

			if (argument === 'true') {
				let out = [];
				for (let i = 0; i < clean.length; i++) {
					if (clean[i] === '0') {
						out.push(zero);
					} else {
						out.push(singles[clean[i]]);
					}
				}
				return out.join(' ');
			}

			let split = [];
			for (let i = 0; i < clean.length; i+= 3) {
				split.unshift(parseInt(clean.substring(clean.length - i - 3, clean.length - i)));
			}
			let out = '';
			split.forEach((bunch, index) => {
				const string = bunch.toString();
				let secondPart = parseInt(string.substring(string.length - 2, string.length));
				if (isNaN(secondPart)) secondPart = bunch;
				if (secondPart === 0) {
					secondPart = '';
				} else if (secondPart < 10) {
					secondPart = singles[secondPart];
				} else if (secondPart < 20) {
					secondPart = teens[secondPart - 10];
				} else if (secondPart < 100) {
					const parts = secondPart.toString();
					const double = parseInt(parts[0]);
					const single = parseInt(parts[1]);
					secondPart = `${doubles[double - 2]} ${singles[single]}`;
				}
				let trickyPart = secondPart;
				if (bunch >= 100) {
					const parts = bunch.toString();
					const triple = parseInt(parts[0]);
					trickyPart = `${singles[triple]} ${bigs[0]} ${trickyPart}`;
				}
				if (index === split.length - 1) {
					const hundreds = parseInt(bunch.toString()[0]);
					out = `${out} ${trickyPart}`;
				} else {
					out = `${out} ${trickyPart} ${bigs[split.length - index - 1]},`;
				}
			});

			return out.trim();
		},
		'single'
	).addParameters({
		'[individual]': 'Whether or not to speak each digit individually instead of together as one number'
	}),
	'clear': new Operator(
		'clear',
		'Creates an empty string. \nUsage: clear',
		(input, argument, inputIndex) => {
			return '';
		},
		'single'
	),
	'in': new Operator(
		'in',
		'Adds inputs at a later point in the operations. \nUsage: in input',
		(input, argument, inputIndex) => {
			if (inputIndex === 0) {
				const args = splitArgs(argument);
				let out = [input];
				args.forEach((arg) => {
					out.push(parseInput(arg));
				});
				return out;
			} else {
				return input;
			}
		},
		'single'
	).addParameters({
		'input': 'The input to add to the value list'
	}),
	'divide': new Operator(
		'divide',
		'Splits a string into multiple values at an interval. \nUsage: divide interval',
		(input, argument, inputIndex) => {
			const interval = parseIntArg(argument, input);
			let out = [];
			for (let i = 0; i < input.length; i += interval) {
				let endPoint;
				if (i + interval > input.length) {
					endPoint = input.length;
				} else {
					endPoint = i + interval;
				}
				out.push(input.substring(i, endPoint));
			}
			return out;
		},
		'single'
	).addParameters({
		'interval': 'The interval at which to split the string'
	}),
	'crush': new Operator(
		'crush',
		'Removes all whitespace characters. \nUsage: crush',
		(input, argument, inputIndex) => {
			return input.replace(/\s/mg, '');
		},
		'single'
	),
	'wrap': new Operator(
		'wrap',
		'Wraps lines that exceed a certain length. \nUsage: wrap mode,length',
		(input, argument, inputIndex) => {
			const args = splitArgs(argument);
			const mode = parseInput(args[0]);
			const limit = parseIntArg(args[1], input);

			switch (mode) {
				case 'block': {
					let reduce = input.replace(/\n/mg, '');
					for (let i = limit; i < reduce.length; i+= limit + 1) {
						reduce = replaceAt(reduce, i, 0, '\n');
					}
					return reduce;
				}
				case 'cut': {
					let split = input.split('\n');
					for (let i = 0; i < split.length; i++) {
						if (split[i].length > limit) {
							split[i] = split[i].substring(0, limit);
						}
					}
					return split.join('\n');
				}
			}
		},
		'single'
	).addParameters({
		'mode': 'The wrapping mode. "block" will remove all previous newlines and create a solid block of text. "cut" will remove any text that exceeds the length',
		'length': 'The line length to wrap the text at'
	}),
	'view': new Operator(
		'view',
		'Prints an input prematurely, used for debugging. \nUsage: view',
		(input, argument, inputIndex) => {
			console.log(input);
		},
		'single'
	),
	'cull': new Operator(
		'cull',
		'removes values that are empty. \nUsage: cull',
		(input, argument, inputIndex) => {
			if (input === '' || input === emptyIdentifier) {
				return removeIdentifier;
			} else {
				return input;
			}
		},
		'single'
	)
}