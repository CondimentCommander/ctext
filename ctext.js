#!/usr/bin/env node
import minimist from 'minimist';
import fs from 'fs';

import { operators } from './operators.js'

const argv = minimist(process.argv.slice(2));

const inputList = argv._;
const outputList = argv.o;

const resolveInput = (input) => {
	let text = input;
	if (fs.existsSync(input)) {
		try {
			text = fs.readFileSync(input, 'utf-8');
		} catch (err) {
			console.error(err);
		}
	}
	if (text[0] === "'" || text[0] === '"') {
		text = text.substring(1);
	}
	text = text.replace(/\\n/mg, '\n');
	return text;
};

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

/* Main Function */
const main = () => {
	let inputs = inputList.map((input) => {return resolveInput(input)});
	let outputs = resolveOutputs(outputList);
	const notOps = [
		'o',
		'_'
	];
	let opsToApply = [];
	Object.keys(argv).forEach((item) => {
		if (!notOps.includes(item) && Object.keys(operators).includes(item)) {
			let object = {
				'op': item,
				'arg': argv[item]
			};
			opsToApply.push(object);
		}
	});
	let evaluated = inputs;
	opsToApply.forEach((operator) => {
		let op = operators[operator.op];
		if (op.type === 'single') {
			for (let i = 0; i < evaluated.length; i++) {
				evaluated[i] = op.fun(evaluated[i], operator.arg);
			}
		} else {
			evaluated = op.fun(evaluated, operator.arg);
		}
	});
	evaluated.forEach((value, i) => {
		if (argv.h !== true) {
			console.log('"' + value + '"');
		}
		try {
			if (outputs.length === evaluated.length) {
				writeOutput(outputs[i], value);
			} else if (outputs.length <= evaluated.length && i === 0) {
				outputs.forEach((out) => {
					writeOutput(out, evaluated[0]);
				});
			} else {
				console.log("You have more values than outputs! No outputs were written");
			}
		} catch (err) {
			console.error(err);
		}
	});
};

main();