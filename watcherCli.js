#!/usr/bin/env node
const { watcher } = require('./watcher');
const argv = require('yargs')
    .usage(`Usage: $0 <command> [options]`)
    .command('-p ./src/** -o ./dist', 'Watches ./src/** and outputs to ./dist')
    .command('-s -p ./src/** -o ./dist', 'Runs script once for ./src/** and outputs to ./dist')
    .example('$0 -o ./dist -p ./src/**', 'Watches ./src dir and creates output in ./dist')
    .example('$0 -o ./dist -p ./src/js/** ./src/html/** ./src/css/**', 'Watches selected directories in ./src and creates output in ./dist')
    .example('$0 -s -o ./dist -p ./src/**', 'Runs script once that takes all ./src files and creates output in ./dist')
    .alias('s', 'singleRun')
    .alias('o', 'output')
    .alias('p', 'patterns')
    .array('p')
    .describe('s', 'Run script once')
    .describe('p', 'List of file patterns to match')
    .describe('o', 'Output path')
    .demandOption(['o', 'p'])
    .help('h')
    .alias('h', 'help')
    .epilog('copyright 2019')
    .argv;


const isSingleRun = argv.singleRun;
const WATCHPATTERNS = argv.patterns;
const output = argv.output;

// TODO:
// (1) Config file (ie. watcher.json)?
// (2) some js hook file?
// (3) cli args?

watcher({
    isSingleRun,
    WATCHPATTERNS,
    output
});