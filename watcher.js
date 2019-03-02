const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');
const { SvelteCombine, Html, Js, Css } = require('svelte-module-combine');
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

const noop = () => { };
const entrypointsDefault = {
    ready: noop,
    error: noop,
    change: noop,
    unlink: noop,
    unlinkDir: this.unlink,
    add: noop,
    compile: noop
};

exports.watcher = (
    {
        isSingleRun,
        patterns,
        output,
        outputExtension,
        processors = defaultProcessors,
        entrypoints = {}
    }
) => {
    const onEvent = { ...entrypointsDefault, ...entrypoints };
    const requiredExtensions = mapRequiredProcessors(processors);

    const sc = new SvelteCombine(fs, { output, outputExtension, processors });
    const compile = relativePath => {
        try {
            sc.combine(relativePath);
            onEvent.compile(relativePath);
        } catch (error) {
            onEvent.error(`File ${relativePath} could not be saved due to error: ${error.message}`);
        }
    };

    const onDeleted = (relativePath, relativeWatched) => {
        const { dirStr, modulePath, name, ext } = resolvePath(relativePath, output);
        rimraf.sync(`${dirStr}/${name}${ext}`);
        // Recompile if part of the module was removed
        relativeWatched.filter(pathContains(`${modulePath}/${name}`)).forEach(compile);
    };

    const on = (watcher, eventType, callback) => watcher.on(eventType, (relativePath) => {
        const path = relativePath ? replaceSlashes(relativePath) : null;
        const watched = relativePaths(watcher.getWatched());

        onEvent[eventType](path, watched);
        callback(path, watched);
    });
    const watcher = chokidar.watch(patterns, { persistent: !isSingleRun, cwd: process.cwd() });
    watcher.on('error', onEvent.error);
    on(watcher, 'unlink', onDeleted);
    on(watcher, 'unlinkDir', onDeleted);
    on(watcher, 'change', compile);
    on(watcher, 'ready', (_, relativeWatched) => {
        relativeWatched.filter(pathMatches(requiredExtensions)).forEach(compile);
        on(watcher, 'add', compile);
    });
}