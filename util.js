import fs from 'fs';

export const alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'j', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
export const upperAlphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'J', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

export const emptyIdentifier = 'CTEXT_EMPTY';
export const removeIdentifier = 'CTEXT_REMOVE';

/* Splits comma-separated arguments into an array */
export const splitArgs = (args) => {
	return args.split(',');
};

/* Parses an input and retrieves contents of a file if specified */
export const parseInput = (input) => {
	if (input === undefined || input === emptyIdentifier) return '';
	let text = input.toString();
	text = text.replace(/\\e/img, '');
	if (fs.existsSync(input)) {
		try {
			text = fs.readFileSync(input, 'utf-8');
		} catch (err) {
			console.error(err);
		}
	} else {
		text = text.replace(/\\n/mg, '\n');
		if (text[0] === '?') {
			text = variables[text.substring(1)];
		}
		if (text[0] === '\\') {
			text = text.substring(1);
		}
	}
	return text;
};

export const variables = {};

export const setVar = (name, value) => {
	variables[name] = value;
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
export const linify = (text) => {
	return text.split('\n');
};

/* Converts text lines back into a single string */
export const textify = (lines) => {
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
export const specificIndexOf = (string, regex, pos) => {
	const matches = string.matchAll(regex);
	let positions = [];
	for (const match of matches) {
		positions.push(match.index);
	}
	return positions[pos];
};

/* Parses a single integer argument */
export const parseIntArg = (argument, input) => {
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
export const box = (text, indexes) => {
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
export const replaceAt = (string, pos, size, text) => {
	return string.substring(0, pos) + text + string.substring(pos + size);
};

export const numEncodeMap = {
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
export const numEncode = (string) => {
	const lower = string.toLowerCase();
	let out = [];
	for (let i = 0; i < lower.length; i++) {
		out.push(numEncodeMap[lower[i]]);
	}
	return out;
};

export const numDecodeMap = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'j', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
/* Decodes number-encoded text */
export const numDecode = (nums) => {
	let out = '';
	for (let i = 0; i < nums.length; i++) {
		out = out + (numDecodeMap[nums[i] - 1]);
	}
	return out;
};

/* Wraps a character number if it is too big or small */
export const wrapNum = (value) => {
	if (value > numDecodeMap.length) {
		return value - numDecodeMap.length;
	} else if (value <= 0) {
		return numDecodeMap.length + value;
	} else {
		return value;
	}
};

/* Sets a default value for an argument */
export const defaultValue = (arg, normal) => {
	if (arg === undefined || arg === emptyIdentifier || arg === '') {
		return normal;
	} else {
		return arg;
	}
};

/* Normalizes spacing for changing case */
export const normalizeSpacing = (text, delimiter) => {
	text = text.replace(/(\.|\-|\_| )/mg, delimiter);
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

/* Capitalizes text in title case */
export const caseTitle = (text) => {
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

/* Writes data to a text output file */
export const writeOutput = async (output, text) => {
	if (fs.existsSync(output)) {
		fs.writeFile(output, text, 'utf-8', () => {});
	}
};

/* Limits a value between two points */
export const limitValue = (value, min, max) => {
	if (value < min) {
		return min;
	} else if (value > max) {
		return max;
	} else {
		return value;
	}
};