import * as util from './util.js';
import fs from 'fs';

/* The list of operators available */
export const operators = {
	'reverse': new util.Operator(
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
	'case': new util.Operator(
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
					out = util.normalizeSpacing(input, '_');
					break;
				}
				case 'dot': {
					out = util.normalizeSpacing(input, '.');
					break;
				}
				case 'dash': {
					out = util.normalizeSpacing(input, '-');
					break;
				}
				case 'constant': {
					out = util.normalizeSpacing(input, '_').toUpperCase();
					break;
				}
				case 'title': {
					out = util.caseTitle(input);
					break;
				}
				case 'camel': {
					out = util.normalizeSpacing(input, ' ');
					out = caseTitle(out);
					out = out.replace(/ /mg, '');
					out = util.replaceAt(out, 0, 1, out[0].toLowerCase());
					break;
				}
				case 'pascal': {
					out = util.normalizeSpacing(input, ' ');
					out = util.caseTitle(out);
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
	'join': new util.Operator(
		'join',
		'Joins multiple text strings. \nUsage: join delimiter',
		(inputs, argument) => {
			const arg = util.defaultValue(util.parseInput(argument), '');
			return [inputs.join(arg)];
		},
		'multi'
	).addParameters({
		'delimiter': 'A string to put between each value when they are joined'
	}),
	'append': new util.Operator(
		'append',
		'Appends a string to another. \nUsage: append text',
		(input, argument, inputIndex) => {
			return input + util.defaultValue(util.parseInput(argument), '');
		},
		'single'
	).addParameters({
		'text': 'The text to appened to the end of the string'
	}),
	'repeat': new util.Operator(
		'repeat',
		'Repeats a string a certain amount of times. \nUsage: repeat times,[delimiter]',
		(input, argument, inputIndex) => {
			console.log(argument);
			const args = util.splitArgs(argument);
			const times = util.parseIntArg(util.defaultValue(args[0], '2'), input);
			const delimiter = util.defaultValue(util.parseInput(args[1]), '');
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
	'substring': new util.Operator(
		'substring',
		'Obtains a substring of text. \nUsage: substring start,end OR start-end',
		(input, argument, inputIndex) => {
			if (argument.includes(',')) {
				const args = util.intParseArgs(util.splitArgs(argument), input);
				return input.substring(args[0], args[1]);
			} else if (argument.includes('-')) {
				const args = util.intParseArgs(argument.split('-'), input);
				return input.substring(args[0], args[0] + args[1]);
			} else if (argument !== util.emptyIdentifier) {
				const arg = util.parseIntArg(argument, input);
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
	'boxsub': new util.Operator(
		'boxsub',
		'Selects a substring using row and column indexes. \nUsage: boxsub startrow,startcol,endrow,endcol OR startrow-startcol-endrow-endcol',
		(input, argument, inputIndex) => {
			if (argument.includes(',')) {
				const args = util.intParseArgs(util.splitArgs(argument), input);
				const selection = util.box(input, [args[0], args[1], args[2] + 1, args[3] + 1]);
				return util.textify(selection);
			} else if (argument.includes('-')) {
				const args = util.intParseArgs(argument.split('-'), input);
				const selection = util.box(input, [args[0], args[1], args[0] + args[2], args[1] + args[3]]);
				return util.textify(selection);
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
	'at': new util.Operator(
		'at',
		'Obtains the character at a position. \nUsage: at position OR at row-col',
		(input, argument, inputIndex) => {
			if (input.includes(',')) {
				const args = util.splitArgs(argument);
				args = util.intParseArgs(args, input);
				const lines = linify(input);
				return lines[args[0] - 1][args[1] - 1];
			} else {
				return input[util.parseIntArg(argument, input)];
			}
		},
		'single'
	).addParameters({
		'position': 'Where to obtain the character from',
		'row': 'The row to obtain the character from',
		'col': 'The column to obtain the character from'
	}),
	'replace': new util.Operator(
		'replace',
		'Replaces occurences of a string with another one. \nUsage: replace search,new',
		(input, argument, inputIndex) => {
			const args = util.splitArgs(argument);
			const reg = new RegExp(util.parseInput(args[0]), 'mg');
			return input.replace(reg, util.defaultValue(util.parseInput(args[1]), ''));
		},
		'single'
	).addParameters({
		'search': 'The string to search for',
		'new': 'The string to replace the matches with'
	}),
	'weave': new util.Operator(
		'weave',
		'Interlaces multiple strings. \nUsage: weave size1,size2...',
		(inputs, argument) => {
			const args = util.splitArgs(argument);
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
					size = util.parseIntArg(size, input);
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
	'shrink': new util.Operator(
		'shrink',
		'Removes characters from the beginning or end of text. \nUsage: shrink amount',
		(input, argument, inputIndex) => {
			const arg = util.parseIntArg(util.defaultValue(argument, '-1'), input);
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
	'oneliner': new util.Operator(
		'oneliner',
		'Removes all newlines. \nUsage: oneliner [delimiter]',
		(input, argument, inputIndex) => {
			const arg = util.defaultValue(util.parseInput(argument), '');
			return input.replace(/\n/mg, arg);
		},
		'single'
	).addParameters({
		'[delimiter]': 'A string to separate each line'
	}),
	'place': new util.Operator(
		'place',
		'Replaces text at a specified index. \nUsage: place position,text,[length]',
		(input, argument, inputIndex) => {
			const args = util.splitArgs(argument);
			const index = util.parseIntArg(args[0], input);
			const text = util.parseInput(args[1]);
			const length = util.parseIntArg(util.defaultValue(args[2], text.length.toString()), input);
			return util.replaceAt(input, index, length, util.parseInput(text));
		},
		'single'
	).addParameters({
		'position': 'Where to put the text',
		'text': 'The text to place over the string',
		'[length]': 'The number of characters to replace'
	}),
	'stretch': new util.Operator(
		'stretch',
		'Repeats letters. \nUsage: stretch amount',
		(input, argument, inputIndex) => {
			let out = '';
			const size = util.parseIntArg(util.defaultValue(argument, '1'), input);
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
	'otp': new util.Operator(
		'otp',
		'One time pad cipher. \nUsage: key,mode',
		(input, argument, inputIndex) => {
			const args = util.splitArgs(argument);
			const key = util.numEncode(util.parseInput(args[0]));
			const encoded = util.numEncode(input);

			const mode = args[1];
			let out = [];
			for (let i = 0; i < encoded.length; i++) {
				if (i >= key.length) {
					out.push(encoded[i]);
				} else {
					if (mode === 'encode') {
						out.push(util.wrapNum(encoded[i] + key[i] - 1));
					} else {
						out.push(util.wrapNum(encoded[i] - key[i] + 1));
					}
				}
			}
			return util.numDecode(out);
		},
		'single'
	).addParameters({
		'key': 'The key to use to encode or decode your text. Should be as long or longer than your text',
		'mode': 'The mode for the cipher, either encode or decode'
	}),
	'help': new util.Operator(
		'help',
		'Gives help info. \nUsage: help [operator]',
		(input, argument, inputIndex) => {
			if (argument === util.emptyIdentifier) {
				let out = [];
				for (let i = 0; i < Object.keys(operators).length; i++) {
					out.push(`${Object.keys(operators)[i]} - ${Object.values(operators)[i].desc}`);
				}
				console.log(out.join('\n'));
				return input;
			} else {
				const op = operators[util.replaceAlias(argument)];
				if (op === undefined) {
					console.log("util.Operator does not exist!");
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
	'insert': new util.Operator(
		'insert',
		'Inserts text at a position in another string. \nUsage: insert text,position',
		(input, argument, inputIndex) => {
			const args = util.splitArgs(argument);
			const pos = util.parseIntArg(args[1], input);
			return input.substring(0, pos) + util.parseInput(args[0]) + input.substring(pos);
		},
		'single'
	).addParameters({
		'text': 'The text to insert',
		'position': 'where to insert the text'
	}),
	'squash': new util.Operator(
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
	'abbreviate': new util.Operator(
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
	'duplicate': new util.Operator(
		'duplicate',
		'Duplicates a single input into multiple of the same. \nUsage: duplicate times',
		(input, argument, inputIndex) => {
			const times = util.parseIntArg(util.defaultValue(argument, '1'), input) + 1;
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
	'split': new util.Operator(
		'split',
		'Splits a string into multiple values based on a delimiter. \nUsage: split delimiter',
		(input, argument, inputIndex) => {
			const split = input.split(util.defaultValue(util.parseInput(argument), ' '));
			return split;
		},
		'single'
	).addParameters({
		'delimiter': 'What to split the string on. Will not be included in the final string'
	}),
	'erase': new util.Operator(
		'erase',
		'Removes part of a string. \nUsage: erase start,end OR erase start-end OR erase pos',
		(input, argument, inputIndex) => {
			if (argument.includes(',')) {
				const args = util.intParseArgs(util.splitArgs(argument), input);
				return util.replaceAt(input, args[0], args[1] - args[0], '');
			} else if (argument.includes('-')) {
				const args = util.intParseArgs(argument.split('-'), input);
				return util.replaceAt(input, args[0], args[1], '');
			} else {
				const arg = util.parseIntArg(argument, input);
				let endPos = input.substring(arg + 1).indexOf(' ');
				if (endPos === -1) endPos = input.length;
				return util.replaceAt(input, arg, endPos + 1, '');
			}
		},
		'single'
	).addParameters({
		'start': 'The position to begin erasing at',
		'end': 'The position to end erasing. If a hyphen is used to separate the arguments, will use relative positioning',
		'pos': 'A word position using w syntax. Will erase the whole word'
	}),
	'length': new util.Operator(
		'length',
		'Obtains the length of a string, including any whitespace. \nUsage: length',
		(input, argument, inputIndex) => {
			return input.length.toString();
		},
		'single'
	),
	'characters': new util.Operator(
		'characters',
		'Counts the number of non-whitespace characters in a string. \nUsage: characters',
		(input, argument, inputIndex) => {
			const remove = input.replace(/\s/mg, '');
			return remove.length.toString();
		},
		'single'
	),
	'lines': new util.Operator(
		'lines',
		'Counts how many lines are in a string. Usage: lines',
		(input, argument, inputIndex) => {
			const split = input.split('\n');
			return split.length.toString();
		},
		'single'
	),
	'words': new util.Operator(
		'words',
		'Counts the number of words in a string',
		(input, argument, inputIndex) => {
			const split = input.split(/[^a-z0-9\']/img).filter((item) => {
				return item !== util.emptyIdentifier && item !== '';
			});
			return split.length.toString();
		},
		'single'
	),
	'filter': new util.Operator(
		'filter',
		'Filters lines that follow a criteria. \nUsage: filter mode, criteria',
		(input, argument, inputIndex) => {
			const split = input.split('\n');
			const args = util.splitArgs(argument);
			let out = [];
			switch (util.parseInput(args[0])) {
				case 'has': {
					const search = util.parseInput(args[1]);
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
	'sort': new util.Operator(
		'sort',
		'Sorts lines based on a criteria',
		(input, argument, inputIndex) => {
			const split = input.split('\n');
			const args = util.splitArgs(argument);

			const sortAlphabetically = (lines) => {
				
			};

			let out = [];
			switch (util.parseInput(args[0])) {
				case 'az': {
					
					break;
				}
			}
			return out.join('\n');
		},
		'single'
	),
	'cshift': new util.Operator(
		'cshift',
		'Caesar\'s shift cipher. \nUsage: cshift offset',
		(input, argument, inputIndex) => {
			const amount = util.parseIntArg(argument);
			const encode = util.numEncode(input);
			let out = [];
			encode.forEach((char) => {
				out.push(util.wrapNum(char + amount));
			});
			return util.numDecode(out);
		},
		'single'
	).addParameters({
		'offset': 'How many characters to shift the letters by'
	}),
	'unshift': new util.Operator(
		'unshift',
		'A tool to help with deciphering a caesarian shift. \nUsage: unshift',
		(input, argument, inputIndex) => {
			let out = '';
			for (let i = 0; i < util.numDecodeMap.length; i++) {
				out = out + operators['cshift'].fun(input, i.toString()) + '\n';
			}
			return out;
		},
		'single'
	),
	'find': new util.Operator(
		'find',
		'Finds occurences of a string',
		(input, argument, inputIndex) => {

		}
	),
	'linenumbers': new util.Operator(
		'linenumbers',
		'Adds line numbers to text. \nUsage: linenumbers start',
		(input, argument, inputIndex) => {
			const split = input.split('\n');
			const offset = util.parseIntArg(util.defaultValue(argument, '1'), input);
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
	'pad': new util.Operator(
		'pad',
		'Adds characters to a string to make it reach a certain length. \nUsage: pad length,character',
		(input, argument, inputIndex) => {
			const args = util.splitArgs(argument);
			const length = util.parseIntArg(args[0], input);
			const character = util.defaultValue(util.parseInput(args[1]), ' ');
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
		'character': 'The character used to pad the string to size. Defaults to space'
	}),
	'toss': new util.Operator(
		'toss',
		'Inserts a set of strings at random positions in another string. \nUsage: toss amount,item1,item2...',
		(input, argument, inputIndex) => {
			let args = util.splitArgs(argument);
			const times = util.parseIntArg(args[0], input);
			args.splice(0, 1);
			let out = input;
			for (let i = 0; i < times; i++) {
				const choice = Math.floor(Math.random() * args.length);
				const pos = Math.floor(Math.random() * out.length);
				out = util.replaceAt(out, pos, 0, args[choice]);
			}
			return out;
		},
		'single'
	).addParameters({
		'amount': 'The number of times to place items in the string',
		'item#': 'A string that has a chance to be tossed into the output'
	}),
	'numwords': new util.Operator(
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
	'clear': new util.Operator(
		'clear',
		'Creates an empty string. \nUsage: clear',
		(input, argument, inputIndex) => {
			return '';
		},
		'single'
	),
	'in': new util.Operator(
		'in',
		'Adds inputs at a later point in the operations. \nUsage: in input1,input2...',
		(input, argument, inputIndex) => {
			if (inputIndex === 0) {
				const args = util.splitArgs(argument);
				let out = [input];
				args.forEach((arg) => {
					out.push(util.parseInput(arg));
				});
				return out;
			} else {
				return input;
			}
		},
		'single'
	).addParameters({
		'input#': 'An input to add to the value list'
	}),
	'divide': new util.Operator(
		'divide',
		'Splits a string into multiple values at an interval. \nUsage: divide interval',
		(input, argument, inputIndex) => {
			const interval = util.parseIntArg(util.defaultValue(argument, '1'), input);
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
	'crush': new util.Operator(
		'crush',
		'Removes all whitespace characters. \nUsage: crush',
		(input, argument, inputIndex) => {
			return input.replace(/\s/mg, '');
		},
		'single'
	),
	'wrap': new util.Operator(
		'wrap',
		'Wraps lines that exceed a certain length. \nUsage: wrap mode,length',
		(input, argument, inputIndex) => {
			const args = util.splitArgs(argument);
			const mode = util.parseInput(args[0]);
			const limit = util.parseIntArg(args[1], input);

			switch (mode) {
				case 'block': {
					let reduce = input.replace(/\n/mg, '');
					for (let i = limit; i < reduce.length; i+= limit + 1) {
						reduce = util.replaceAt(reduce, i, 0, '\n');
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
	'view': new util.Operator(
		'view',
		'Prints an input prematurely, used for debugging. \nUsage: view',
		(input, argument, inputIndex) => {
			console.log(input);
		},
		'single'
	),
	'cull': new util.Operator(
		'cull',
		'removes values that are empty. \nUsage: cull',
		(input, argument, inputIndex) => {
			if (input === '' || input === util.emptyIdentifier) {
				return util.removeIdentifier;
			} else {
				return input;
			}
		},
		'single'
	),
	'dummy': new util.Operator(
		'dummy',
		'Generates dummy text. \nUsage: dummy mode',
		(input, argument, inputIndex) => {
			const args = util.splitArgs(argument);
			const mode = util.defaultValue(util.parseInput(args[0]), 'lorem');
			const words = util.parseIntArg(util.defaultValue(args[1], '15'), input);

			const text = {
				'lorem': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla semper odio nunc, in gravida mauris efficitur at. Pellentesque faucibus ligula et lacinia accumsan. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Ut accumsan nisi ut felis volutpat lacinia. Integer tristique nibh nulla, a congue nulla pellentesque in. Vestibulum mattis vulputate velit, ac hendrerit tellus malesuada in. Maecenas id eros sollicitudin nisi ultrices luctus id eu nibh. Curabitur hendrerit ultricies libero, dictum imperdiet eros sodales id. Suspendisse id consectetur metus.truetrueNulla facilisi. Aliquam erat volutpat. Quisque viverra leo eget risus vehicula, id pharetra dolor fringilla. Phasellus tempus lorem vel ornare vestibulum. Proin non metus odio. Aliquam pellentesque convallis varius. Cras cursus diam id orci euismod lobortis.truetrueNam metus leo, auctor vel odio ac, iaculis tempor ante. Aliquam id mauris quis dolor vestibulum feugiat. Etiam ullamcorper est vel nibh gravida viverra. Morbi scelerisque, lacus dictum molestie vestibulum, dolor ante fringilla quam, sed vehicula magna felis non risus. Sed in eros malesuada, imperdiet dui non, iaculis quam. In quis nisl a magna gravida venenatis non ac turpis. Vestibulum et sapien elit. Phasellus viverra odio imperdiet dolor gravida feugiat. Donec sit amet magna at ante sagittis semper.truetrueIn tristique nunc felis, in posuere magna aliquet eu. Cras hendrerit efficitur quam nec vestibulum. Ut metus nisl, malesuada non laoreet eget, mattis quis nisi. Sed vehicula turpis in eros efficitur, vel euismod mi commodo. Praesent mollis nibh consequat elementum sagittis. Morbi quis elit leo. Maecenas dictum hendrerit finibus. Pellentesque ut ultricies mi. Ut et aliquam libero, eu rutrum lorem. Vestibulum ut ante lorem. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Duis elementum interdum nulla feugiat tempus.truetrueDonec lectus lorem, auctor vitae risus in, semper lacinia tortor. Phasellus fermentum magna nec mauris varius, at ullamcorper magna euismod. Vestibulum vitae libero vestibulum, dignissim lorem at, congue magna. Donec blandit rhoncus placerat. Donec metus mi, condimentum vel varius a, sodales quis libero. Suspendisse metus nulla, congue quis lacus nec, ullamcorper scelerisque libero. Ut auctor molestie metus, dictum venenatis massa eleifend a.'
			};
			return text[mode];
		},
		'single'
	).addParameters({
		'mode': 'The text to generate'
	}),
	'content': new util.Operator(
		'content',
		'Removes all non-word characters. \nUsage: content',
		(input, argument, inputIndex) => {
			return input.replace(/\W/img, '');
		},
		'single'
	),
	'out': new util.Operator(
		'out',
		'Sends text to a file at an earlier point. \nUsage: out path1,path2...',
		(input, argument, inputIndex) => {
			const args = util.splitArgs(argument);
			args.forEach((arg) => {
				util.writeOutput(arg, input)
			});
			return input;
		},
		'single'
	).addParameters({
		'path#': 'The file path to send data to'
	}),
	'set': new util.Operator(
		'set',
		'Sets a variable to the input. \nUsage: set name',
		(input, argument, inputIndex) => {
			util.setVar(util.defaultValue(util.parseInput(argument), 'temp'), input);
			return input;
		},
		'single'
	).addParameters({
		'name': 'The name of the variable to set'
	}),
	'scramble': new util.Operator(
		'scramble',
		'Rearranges characters in a string. \nUsage: scramble [mode],[factor],[words]',
		(input, argument, inputIndex) => {
			const args = util.splitArgs(argument);
			const mode = util.defaultValue(util.parseInput(args[0]), 'shuffle');
			const fac = util.parseIntArg(util.defaultValue(args[1], '2'), input);
			const words = util.defaultValue(util.parseInput(args[2]), 'true') === 'true';
			let out = [];
			for (let i = 0; i < input.length; i++) {
				out.push(input[i]);
			}
			const swap = (a, b) => {
				return [b, a];
			};

			switch (mode) {
				case 'shuffle': {
					for (let i = 0; i < out.length; i++) {
						const direction = Math.round(Math.random()) * 2 - 1; //Normalize direction to -1 or 1;
						const distance = util.limitValue(Math.floor(Math.random() * fac * direction) + i, 0, out.length - 1); //Get the position of the swap
						/* Swap the values */
						const wordrx = /\w/;
						if (!words || (wordrx.test(out[i]) && wordrx.test(out[distance]))) {
							const positions = swap(out[i], out[distance]);
							out[i] = positions[0];
							out[distance] = positions[1];
						}
					}
					break;
				}
			}
			return out.join('');
		},
		'single'
	).addParameters({
		'[mode]': 'The method to use for scrambling',
		'[factor]': 'To what degree to apply the scramble',
		'[words]': 'Whether or not to only scramble letters'
	})
}