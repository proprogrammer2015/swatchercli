const Gaze = require('gaze').Gaze;
const color = require('colors');
const path = require('path');
const fs = require('fs');
const { SvelteCombine, Html, Js, Css } = require('svelte-module-combine/lib/index');

const logSuccess = text => console.log(color.green(text));
const logError = error => console.log(color.red(`Error: ${error}`));

const replaceSlashes = pathString => `./${pathString.split(/[\\\/]/).join('/')}`;
const relative = (filepath) => replaceSlashes(path.relative(process.cwd(), filepath));
const filterWatched = (files, extList) => {
    return Object.keys(files)
        .map(filepath => files[filepath]
            .filter(path.extname)
            .filter(file => extList.some(ext => ext === path.extname(file)))
            .map(file => replaceSlashes(`${filepath}${file}`))
        )
        .reduce((result, paths) => result.concat(paths), []);
};
const defaultProcessors = [
    new Html(),
    new Js(),
    new Css()
];

exports.watcher = (
    {
        isSingleRun,
        patterns,
        output,
        processors = defaultProcessors
    }
) => {
    const requiredExtensions = processors
        .filter(type => type.isRequired())
        .map(type => `.${type.extension()}`);

    const sc = new SvelteCombine(fs, { output, processors });

    const compile = (sc, relativePath) => {
        try {
            sc.combine(relativePath);
            logSuccess(`${relativePath} was saved`);
        } catch (error) {
            logError(`File could not be saved due to error: ${error.message}`);
        }
    }

    const onReady = watcher => {
        logSuccess(`Compiling: ${patterns}`);

        filterWatched(watcher.relative(), requiredExtensions)
            .forEach(filepath => compile(sc, filepath));

        if (isSingleRun) {
            return watcher.close();
        }
        logSuccess(`Watching: ${patterns}`);
    };

    const onChanged = relativePath => {
        if (path.extname(relativePath)) {
            compile(sc, relativePath);
        }
    };

    const onDeleted = relativePath => console.log(`${relativePath} was deleted`);
    const onRelative = callback => filepath => callback(relative(filepath));

    const gaze = new Gaze(patterns);
    gaze.on('ready', onReady);
    gaze.on('error', logError);
    gaze.on('added', onRelative(onChanged));
    gaze.on('changed', onRelative(onChanged));
    gaze.on('deleted', onRelative(onDeleted));
}