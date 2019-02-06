const Gaze = require('gaze').Gaze;
const color = require('colors');
const path = require('path');
const fs = require('fs');
const { SvelteCombine, Html, Js, Css } = require('svelte-module-combine/lib/index');

const replaceSlashes = pathString => pathString.split(/[\\\/]/).join('/');
const relative = (filepath) => `./${replaceSlashes(path.relative(process.cwd(), filepath))}`;
const matches = a => b => b === a;
const filterWatched = (files, extList) => {
    return Object.keys(files)
        .map(filepath => files[filepath].filter(path.extname).map(file => `${filepath}${file}`))
        .reduce((result, paths) => result.concat(paths), [])
        .map(filepath => `./${replaceSlashes(filepath)}`)
        .filter(filepath => extList.some(matches(path.extname(filepath))))
}
const [, , ...args] = process.argv;
const isSingleRun = args.some(matches('--single-run'));
// TODO:
// (1) Config file (ie. watcher.json)?
// (2) some js hook file?
// (3) cli args?

const processors = [
    new Html(),
    new Js(),
    new Css()
];
const requiredExtensions = processors
    .filter(instance => instance.isRequired())
    .map(instance => `.${instance.extension()}`);

const config = {
    output: './output',
    processors
};
const sc = new SvelteCombine(fs, config);

const compile = (sc, relativePath) => {
    try {
        sc.combine(relativePath);
        console.log(color.green(relativePath + ' was saved'));
    } catch (error) {
        console.log(color.red('File could not be saved due to error:', error.message));
    }
}

const WATCHPATTERNS = 'src/**/*';
const gaze = new Gaze(WATCHPATTERNS);

gaze.on('ready', watcher => {
    console.log(color.green(`Compiling: ${WATCHPATTERNS}`));

    filterWatched(watcher.relative(), requiredExtensions)
        .forEach(htmlPath => compile(sc, htmlPath));

    if (isSingleRun) {
        return watcher.close();
    }
    console.log(color.green(`Watching: ${WATCHPATTERNS}`));
});

gaze.on('error', err => console.log(color.red('Error:', err)));

gaze.on('all', (operation, filepath) => {
    const relativePath = relative(filepath);

    if (['added', 'changed'].some(matches(operation)) && path.extname(relativePath)) {
        compile(sc, relativePath);
    }

    if (['deleted'].some(matches(operation))) {
        console.log(filepath + ' was deleted');
    }
});