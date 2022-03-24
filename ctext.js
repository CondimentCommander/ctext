#!/usr/bin/env node
import minimist from 'minimist';
import chalk from 'chalk';

import { operators } from './operators.js'
import * as util from './util.js';

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
		const split = item.split('[');
		const itemName = split[0].substring(split[0].lastIndexOf('-') + 1, split[0].length);
		if (isOperator(util.replaceAlias(itemName)) && split[0][0] === '-') {
			if (split.length > 1) {
				args.push('--' + util.replaceAlias(itemName) + '[' + split[1]);
			} else {
				args.push('--' + util.replaceAlias(itemName));
			}
			const nextItem = slice[i + 1];
			if (nextItem === undefined) {
				args.push(util.emptyIdentifier);
			} else {
				const nextSplit = nextItem.split('[');
				const nextName = nextSplit[0].substring(nextSplit[0].lastIndexOf('-') + 1, nextSplit[0].length);
				if (nextSplit[0][0] === '-') {
					args.push(util.emptyIdentifier);
				}
			}
		} else {
			args.push(item);
		}
	}
	return minimist(args);
};

/* Fixes output stuff */
const resolveOutputs = (outputs) => {
	if (outputs === undefined) return [];
	const resolve = (item) => {
		
	};
	outputs = util.forceArray(outputs);
	outputs.forEach(resolve);
	return outputs;
};

/* Adds chalk styling */
const fancify = (text) => {
	const numbers = text.matchAll(/\d/mg);
	for (const number of numbers) {

	}
};

const evalInput = async (input, operator, argument) => {
	return operator.fun(input, argument);
};

/* Main Function */
const main = (argv, prof) => {
	const startTime = Date.now();
	//console.log(argv);
	let inputs = argv._.map((input) => {return util.parseInput(input)});
	if (inputs.length === 0) inputs = [''];
	let outputs = resolveOutputs(argv.o);

	/* Find and parse all operator arguments */
	let opsToApply = [];
	Object.keys(argv).forEach((item) => {
		const parts = item.split('[');
		let selection = [];
		if (parts.length >= 2) {
			selection = util.intParseArgs(util.splitArgs(parts[1].substring(0, parts[1].length)));
		}
		const name = parts[0];
		if (isOperator(item)) {
			let argument = util.forceArray(argv[item]);
			argument.forEach((arg) => {
				const object = {
					'name': name,
					'selection': selection,
					'arg': arg.toString()
				};
				opsToApply.push(object);
			});
		}
	});
	/* Apply the operators */
	let evaluated = inputs;
	opsToApply.forEach((operatorArgument) => {
		const opStart = Date.now();
		const lastEvaluation = evaluated;
		evaluated = [];
		let toAppend = [];
		let op = operators[operatorArgument.name];
		util.clearArgCache();
		if (op.type === 'single') {
			for (let i = 0; i < lastEvaluation.length; i++) {
				if (operatorArgument.selection.length === 0 || operatorArgument.selection.includes(i)) {
					let result = op.fun(lastEvaluation[i], operatorArgument.arg, i);
					if (result !== util.removeIdentifier) {
						if (Array.isArray(result)) {
							evaluated.push(result.shift());
							result.forEach((value) => {
								toAppend.push(value);
							});
						} else {
							evaluated.push(result);
						}
					}
				} else {
					evaluated.push(lastEvaluation[i]);
				}
			}
		} else {
			if (operatorArgument.selection.length === 0) {
				evaluated = op.fun(lastEvaluation, operatorArgument.arg, 0);
			} else {
				let items = [];
				lastEvaluation.forEach((value, index) => {
					if (operatorArgument.selection.includes(index)) {
						items.push(value);
					} else {
						evaluated.push(value);
					}
				});
				const operated = op.fun(items, operatorArgument.arg, 0);
				for (let i = 0; i < operated.length; i++) {
					evaluated.push(operated[i]);
				}
			}
		}
		toAppend.forEach((item) => {
			evaluated.push(item);
		});
		prof.ops.push(`Operator ${operatorArgument.name} took ${Date.now() - opStart} milliseconds`);
	});
	const maxLength = 450;
	/* Pipe values to outputs */
	evaluated.forEach((value, i) => {
		if (argv.h !== true) {
			if (value.length <= maxLength || argv.f === true) {
				console.log(`${chalk.green('"')}${chalk.greenBright(value)}${chalk.green('"')}`);
			} else {
				console.log(chalk.yellow(`String ${i} is larger than ${maxLength} characters, will not print`));
			}
		}
		try {
			if (outputs.length > 0) {
				if (outputs.length === evaluated.length) {
					util.writeOutput(outputs[i], value);
				} else if (outputs.length <= evaluated.length && i === 0) {
					outputs.forEach((out) => {
						util.writeOutput(out, evaluated[0]);
					});
				} else {
					console.log(chalk.red('You have more values than outputs! No outputs were written'));
				}
			}
		} catch (err) {
			console.error(err);
		}
	});
	if (argv.p === true) {
		console.log(chalk.blueBright(`Processing command took ${prof.args} milliseconds`));
		prof.ops.forEach((msg) => {
			console.log(chalk.blueBright(msg));
		});
		console.log(chalk.blueBright(`Processing operations took ${Date.now() - startTime} milliseconds`));
	}
};

var profiling = {
	'ops': []
};
var preParseStart = Date.now();
var args = processArgs();
profiling.args = Date.now() - preParseStart;
await main(args, profiling);

process.exit(0);