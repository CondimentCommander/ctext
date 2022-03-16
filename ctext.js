#!/usr/bin/env node
import minimist from 'minimist';
import fs from 'fs';

import { intParseArgs, operators, splitArgs, resolveInput } from './operators.js'

const argv = minimist(process.argv.slice(2));

const inputList = argv._;
const outputList = argv.o;

const resolveOutputs = (outputs) => {
	if (outputs === undefined) return [];
	const resolve = (item) => {
		
	};
	if (typeof outputs !== 'Array') {
		outputs = [outputs];
	}
	outputs.forEach(resolve);
	return outputs;
};

const writeOutput = async (output, text) => {
	if (fs.existsSync(output)) {
		fs.writeFile(output, text, 'utf-8', () => {});
	}
};

const evalInput = async (input, operator, argument) => {
	return operator.fun(input, argument);
};

/* Main Function */
const main = () => {
	let inputs = inputList.map((input) => {return resolveInput(input)});
	if (inputs.length === 0) inputs = [''];
	let outputs = resolveOutputs(outputList);
	const notOps = [
		'o',
		'_'
	];
	/* Find and parse all operator arguments */
	let opsToApply = [];
	Object.keys(argv).forEach((item) => {
		const parts = item.split('[');
		let selection = [];
		if (parts.length >= 2) {
			selection = intParseArgs(splitArgs(parts[1].substring(0, parts[1].length)));
		}
		const name = parts[0];
		if (!notOps.includes(name) && Object.keys(operators).includes(name)) {
			const object = {
				'name': name,
				'selection': selection,
				'arg': argv[item]
			};
			opsToApply.push(object);
		}
	});
	/* Apply the operators */
	let evaluated = inputs;
	opsToApply.forEach((operatorArgument) => {
		let op = operators[operatorArgument.name];
		if (op.type === 'single') {
			for (let i = 0; i < evaluated.length; i++) {
				if (operatorArgument.selection.length === 0 || operatorArgument.selection.includes(i)) {
					evaluated[i] = op.fun(evaluated[i], operatorArgument.arg);
				}
			}
		} else {
			if (operatorArgument.selection.length === 0) {
				evaluated = op.fun(evaluated, operatorArgument.arg);
			} else {
				let items = [];
				evaluated.forEach((value, index) => {
					if (operatorArgument.selection.includes(index)) {
						items.push(value);
					}
				});
				for (let i = 0; i < operatorArgument.selection.length; i++) {
					evaluated.splice(operatorArgument.selection[i] - i, 1);
				}
				const operated = op.fun(items, operatorArgument.arg);
				for (let i = 0; i < operated.length; i++) {
					evaluated.splice(operatorArgument.selection[i], 0, operated[i]);
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

main();