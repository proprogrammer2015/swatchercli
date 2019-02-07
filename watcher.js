const Gaze = require('gaze').Gaze;
const color = require('colors');
const path = require('path');
const fs = require('fs');
const { SvelteCombine, Html, Js, Css } = require('svelte-module-combine/lib/index');

const logSuccess = text => console.log(color.green(text));
const logError = text => console.log(color.red(text));

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

exports.watcher = (
    {
        isSingleRun,
        WATCHPATTERNS,
        output
    }
) => {
    const config = {
        output,
        processors: [
            new Html(),
            new Js(),
            new Css()
        ]
    }
    const requiredExtensions = config.processors
        .filter(type => type.isRequired())
        .map(type => `.${type.extension()}`);

    const sc = new SvelteCombine(fs, config);

    const compile = (sc, relativePath) => {
        try {
            sc.combine(relativePath);
            logSuccess(relativePath + ' was saved');
        } catch (error) {
            logError('File could not be saved due to error:', error.message);
        }
    }

    const onReady = watcher => {
        logSuccess(`Compiling: ${WATCHPATTERNS}`);

        filterWatched(watcher.relative(), requiredExtensions)
            .forEach(filepath => compile(sc, filepath));

        if (isSingleRun) {
            return watcher.close();
        }
        logSuccess(`Watching: ${WATCHPATTERNS}`);
    };

    const onChanged = (operation, filepath) => {
        const relativePath = relative(filepath);

        if (['added', 'changed'].some(matches(operation)) && path.extname(relativePath)) {
            compile(sc, relativePath);
        }

        if (['deleted'].some(matches(operation))) {
            console.log(filepath + ' was deleted');
        }
    };


    const gaze = new Gaze(WATCHPATTERNS);
    gaze.on('ready', onReady);
    gaze.on('error', err => logError('Error:', err));
    gaze.on('all', onChanged);
}