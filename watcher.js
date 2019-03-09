const chokidar = require('chokidar');
const path = require('path');
const color = require('colors');
const fs = require('fs');
const rimraf = require('rimraf');
const { AnyFileMerge, Html, Js, Css } = require('any-file-merge');
const { resolvePath } = require('corresponding-path');

const replaceSlashes = pathString => `./${pathString.split(/[\\\/]/).join('/')}`;
const pathMatches = list => filepath => list.some(ext => ext === path.extname(filepath));
const pathContains = pattern => path => path.indexOf(pattern) !== -1
const relativePaths = (files) => {
    return Object.keys(files)
        .map(filepath => files[filepath]
            .filter(path.extname)
            .map(file => replaceSlashes(`${filepath}/${file}`))
        )
        .reduce((result, paths) => result.concat(paths), [])
};
const defaultProcessors = [
    new Html(),
    new Js(),
    new Css()
];

const mapRequiredProcessors = processors => processors
    .filter(type => type.isRequired())
    .map(type => `.${type.extension()}`);

const defaultOutput = {
    delete: path => console.log(color.grey(`${path} was removed.`)),
    error: msg => console.log(color.red(`ERROR: ${msg}`)),
    compile: (path) => console.log(color.green(`${path} was compiled.`)),
    change: (path) => console.log(color.green(`${path} was changed.`)),
    add: (path) => console.log(color.blue(`${path} was added.`)),
    ready: () => console.table(color.inverse(`[any-file-merge]`))
};
const entrypointsDefault = (entrypoints = {}) => {
    return {
        ready: entrypoints.ready || defaultOutput.ready,
        error: entrypoints.error || defaultOutput.error,
        change: entrypoints.change || defaultOutput.change,
        unlink: entrypoints.delete || defaultOutput.delete,
        unlinkDir: entrypoints.delete || defaultOutput.delete,
        add: entrypoints.add || defaultOutput.add,
        compile: entrypoints.compile || defaultOutput.compile
    };
};

exports.watcher = (
    {
        watch,
        patterns,
        output,
        processors = defaultProcessors,
        entrypoints,
        fileName,
        quiet
    }
) => {
    const onEvent = entrypointsDefault(entrypoints);
    const requiredExtensions = mapRequiredProcessors(processors);

    const sc = new AnyFileMerge(fs, { output, fileName, processors });
    const compile = relativePath => {
        try {
            sc.combine(relativePath);
            onEvent.compile(relativePath);
        } catch (error) {
            onEvent.error(`File ${relativePath} could not be saved due to error: ${error.message}`);
        }
    };

    const onDeleted = (relativePath, relativeWatched) => {
        const path = resolvePath(relativePath, output);
        rimraf.sync(path.output.full);
        // Recompile if part of the module was removed
        relativeWatched.filter(pathContains(`${path.input.modulePath}`)).forEach(compile);
    };

    const on = (watcher, eventType, callback) => watcher.on(eventType, (relativePath) => {
        const inputPath = replaceSlashes(relativePath);
        const watched = relativePaths(watcher.getWatched());

        onEvent[eventType](inputPath, watched);
        callback(inputPath, watched);
    });
    const watcher = chokidar.watch(patterns, { persistent: watch, cwd: process.cwd() });
    watcher.on('error', onEvent.error);
    on(watcher, 'unlink', onDeleted);
    on(watcher, 'unlinkDir', onDeleted);
    on(watcher, 'change', compile);
    watcher.on('ready', () => {
        const watched = relativePaths(watcher.getWatched())
        watched.filter(pathMatches(requiredExtensions)).forEach(compile);
        onEvent.ready(watched);
        on(watcher, 'add', compile);
    });
}