const { Html, Js, Css } = require('any-file-merge');

exports.watch = true;
exports.quiet = false;
exports.patterns = [
    './src/components/**',
    '!./src/components/**/*.svelte'
];
exports.output = './output';
exports.fileName = '.html';
exports.processors = [
    new Html(),
    new Js(),
    new Css()
];

// TODO: should override output
exports.entrypoints = {
    ready: () => {}
}