const { Html, Js, Css } = require('any-file-merge');

exports.watch = true;
exports.quiet = false;
exports.patterns = [
    './src/components/**',
    '!./src/components/**/*.svelte'
];
exports.output = './src';
exports.fileName = '.svelte';
exports.processors = [
    new Html(),
    new Js(),
    new Css()
];

// TODO: should override output
exports.hooks = {
}