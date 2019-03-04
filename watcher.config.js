const color = require('colors');
const { Html, Js, Css } = require('svelte-module-combine/lib/index');

exports.watch = false;
exports.patterns = [
    './src/**'
];
exports.output = './output';
exports.outputExtension = 'html';
exports.filename = 'changed-[name]-of-this-file';
exports.processors = [
    new Html(),
    new Js(),
    new Css()
];
exports.entrypoints = {
    delete: path => console.log(color.grey(`${path} was removed.`)),
    error: msg => console.log(color.red(`ERROR: ${msg}`)),
    compile: (path, all) => console.log(color.green(`${path} was compiled.`)),
    change: (path, all) => console.log(color.yellow(`${path} was changed.`)),
    add: (path, all) => console.log(color.blue(`${path} was added.`)),
    ready: (_, all) => console.table(color.rainbow(`[SVELTE MODULE COMBINE]`))
}