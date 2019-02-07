#!/usr/bin/env node
const { watcher } = require('./watcher');
const color = require('colors');
const argv = require('yargs')
    .usage(`Usage: $0 <command> [options]`)
    .command('-p ./src/** -o ./dist', 'Watches ./src/** and outputs to ./dist')
    .command('-s -p ./src/** -o ./dist', 'Runs script once for ./src/** and outputs to ./dist')
    .command('-c ./watcher.config.js', 'Imports configuration file.')
    .command('-j ./watcher.config.json', 'Imports json configuration file.')
    .example('$0 -o ./dist -p ./src/**', 'Watches ./src dir and creates output in ./dist')
    .example('$0 -o ./dist -p ./src/js/** ./src/html/** ./src/css/**', 'Watches selected directories in ./src and creates output in ./dist')
    .example('$0 -s -o ./dist -p ./src/**', 'Runs script once that takes all ./src files and creates output in ./dist')
    .example('$0 -c watcher.config.js', 'Imports configuration file.')
    .example('$0 -j watcher.config.json', 'Imports json configuration file.')
    .alias('s', 'isSingleRun')
    .alias('o', 'output')
    .alias('p', 'patterns')
    .alias('c', 'config')
    .alias('j', 'json')
    .array('p')
    .describe('s', 'Run script once')
    .describe('p', 'List of file patterns to match')
    .describe('o', 'Output path')
    .describe('c', 'Configuration file path')
    .describe('j', 'Configuration json file path')
    // .demandCommand(1, color.red('Please specify any option'))
    .config('c', function (configPath) {
        return require(configPath);
    })
    .config('j')
    // .conflicts('o', 'c')
    // .conflicts('p', 'c')
    .help('h')
    .alias('h', 'help')
    .epilog('copyright 2019')
    .argv;

watcher(argv);