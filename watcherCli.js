#!/usr/bin/env node
const { watcher } = require('./watcher');
const color = require('colors');
const argv = require('yargs')
    .usage(`Usage: $0 <command> [options]`)
    .command('-p ./src/** -o ./dist', 'Watches ./src/** and outputs to ./dist')
    .command('-s -p ./src/** -o ./dist', 'Runs script once for ./src/** and outputs to ./dist')
    .command('-c ./watcher.config.js', 'Imports configuration file and can use custom processors')
    .command('-j ./watcher.config.json', 'Imports json configuration file and will use default processors [html, js, css]')
    .example('$0 -o ./dist -p ./src/**', 'Watches ./src dir and creates output in ./dist')
    .example('$0 -o ./dist -p ./src/js/** ./src/html/** ./src/css/**', 'Watches selected directories in ./src and creates output in ./dist')
    .example('$0 -s -o ./dist -p ./src/**', 'Runs script once that takes all ./src files and creates output in ./dist')
    .example('$0 -c watcher.config.js', 'Imports configuration file.')
    .example('$0 -j watcher.config.json', 'Imports json configuration file.')
    .option('s', {
        alias: 'isSingleRun',
        type: 'boolean',
        describe: 'Run script once'
    })
    .option('o', {
        alias: 'output',
        type: 'string',
        describe: 'Output path'
    })
    .option('p', {
        alias: 'patterns',
        type: 'array',
        describe: 'List of file patterns to match'
    })
    .option('c', {
        alias: 'config',
        type: 'string',
        config: true,
        describe: 'Path to js configuration file',
        configParser: configPath => require(configPath)
    })
    .option('j', {
        alias: 'json',
        type: 'string',
        config: true,
        describe: 'Path to JSON configuration file'
    })
    .help('h')
    .alias('h', 'help')
    .epilog('copyright 2019')
    .argv;

watcher(argv);