#!/usr/bin/env node
import minimist from 'minimist';
import fs from 'fs';

import { intParseArgs, operators, splitArgs, parseInput } from './operators.js'

/* Detects if an argument is an operator */
const isOperator = (argument) => {
	const notOps = [
		'o',
		'_'
	];
	const parts = argument.split('[');
	return !(notOps.includes(parts[0])) && Object.keys(operators).includes(parts[0]);
};

/* Does preprocessing on the command before sending args to minimist */
const processArgs = () => {
	const slice = process.argv.slice(2);
	let args = [];
	for (let i = 0; i < slice.length; i++) {
		const item = slice[i];
		args.push(item);
		if (isOperator(item.substring(item.lastIndexOf('-') + 1, item.length))) {
			const nextItem = slice[i + 1];
			if (nextItem === undefined) {
				args.push('CTEXT_EMPTY');
			} else {
				if (isOperator(nextItem.substring(nextItem.lastIndexOf('-') + 1, nextItem.length))) {
					args.push('CTEXT_EMPTY');
				}
			}
		}
	}
	return minimist(args);
};

/* Fixes output stuff */
const resolveOutputs = (outputs) => {
	if (outputs === undefined) return [];
	const resolve = (item) => {
		
	};
	outputs = forceArray(outputs);
	outputs.forEach(resolve);
	return outputs;
};

/* Writes data to a text output file */
const writeOutput = async (output, text) => {
	if (fs.existsSync(output)) {
		fs.writeFile(output, text, 'utf-8', () => {});
	}
};

/* Takes a value and encapsulates it in an array if it isn't one already */
const forceArray = (value) => {
	if (Array.isArray(value)) {
		return value;
	} else {
		return [value];
	}
};

const evalInput = async (input, operator, argument) => {
	return operator.fun(input, argument);
};

/* Main Function */
const main = (argv) => {
	//console.log(argv);
	let inputs = argv._.map((input) => {return parseInput(input)});
	if (inputs.length === 0) inputs = [''];
	let outputs = resolveOutputs(argv.o);

	/* Find and parse all operator arguments */
	let opsToApply = [];
	Object.keys(argv).forEach((item) => {
		const parts = item.split('[');
		let selection = [];
		if (parts.length >= 2) {
			selection = intParseArgs(splitArgs(parts[1].substring(0, parts[1].length)));
		}
		const name = parts[0];
		if (isOperator(item)) {
			let argument = forceArray(argv[item]);
			argument.forEach((arg) => {
				const object = {
					'name': name,
					'selection': selection,
					'arg': arg
				};
				opsToApply.push(object);
			});
		}
	});
	/* Apply the operators */
	let evaluated = inputs;
	opsToApply.forEach((operatorArgument) => {
		const lastEvaluation = evaluated;
		evaluated = [];
		let op = operators[operatorArgument.name];
		if (op.type === 'single') {
			for (let i = 0; i < lastEvaluation.length; i++) {
				if (operatorArgument.selection.length === 0 || operatorArgument.selection.includes(i)) {
					let result = op.fun(lastEvaluation[i], operatorArgument.arg);
					if (Array.isArray(result)) {
						result.forEach((value) => {
							evaluated.push(value);
						});
					} else {
						evaluated.push(result);
					}
				}
			}
		} else {
			if (operatorArgument.selection.length === 0) {
				evaluated = op.fun(lastEvaluation, operatorArgument.arg);
			} else {
				let items = [];
				lastEvaluation.forEach((value, index) => {
					if (operatorArgument.selection.includes(index)) {
						items.push(value);
					}
				});
				for (let i = 0; i < operatorArgument.selection.length; i++) {
					//evaluated.splice(operatorArgument.selection[i] - i, 1);
				}
				const operated = op.fun(items, operatorArgument.arg);
				for (let i = 0; i < operated.length; i++) {
					//evaluated.splice(operatorArgument.selection[i], 0, operated[i]);
					evaluated.push(operated[i]);
				}
			}
		}
	});
	/* Pipe values to outputs */
	evaluated.forEach((value, i) => {
		if (argv.h !== true) {
			const maxLength = 150;
			if (value.length <= maxLength) {
				console.log('"' + value + '"');
			} else {
				console.log("String is larger than " + maxLength + " characters, will not print");
			}
		}
		try {
			if (outputs.length > 0) {
				if (outputs.length === evaluated.length) {
					writeOutput(outputs[i], value);
				} else if (outputs.length <= evaluated.length && i === 0) {
					outputs.forEach((out) => {
						writeOutput(out, evaluated[0]);
					});
				} else {
					console.log("You have more values than outputs! No outputs were written");
				}
			}
		} catch (err) {
			console.error(err);
		}
	});
};

main(processArgs());