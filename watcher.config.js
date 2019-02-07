const { Html, Js, Css } = require('svelte-module-combine/lib/index');

exports.isSingleRun = false;
exports.patterns = [
    './src/**'
];
exports.output = './output';
exports.processors = [
    new Html(),
    new Js(),
    new Css()
];