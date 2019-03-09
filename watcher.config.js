const { Html, Js, Css } = require('any-file-merge');

const ext = '.svelte';
exports.watch = true;
exports.quiet = false;
exports.patterns = [
    './src/components/**',
    `!./src/components/**/*${ext}`
];
exports.output = './output';
exports.fileName = `${ext}`;
exports.processors = [
    new Html(),
    new Js(),
    new Css()
];

// TODO: should override output
exports.hooks = {
}