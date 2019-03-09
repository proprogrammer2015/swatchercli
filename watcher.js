const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');
const { AnyFileMerge, Html, Js, Css } = require('any-file-merge');
const { resolvePath } = require('corresponding-path');
const { createHooks } = require('./hooks');

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

exports.watcher = (
    {
        watch,
        patterns,
        output,
        processors = defaultProcessors,
        hooks,
        fileName,
        quiet
    }
) => {
    const hook = createHooks(hooks, quiet);
    const requiredExtensions = mapRequiredProcessors(processors);

    const sc = new AnyFileMerge(fs, { output, fileName, processors });
    const compile = relativePath => {
        try {
            sc.combine(relativePath);
            hook.compile(relativePath);
        } catch (error) {
            hook.error(`File ${relativePath} could not be saved due to error: ${error.message}`);
        }
    };

    const onDeleted = (relativePath, relativeWatched) => {
        const path = resolvePath(relativePath, output);
        const ext = fileName.substr(0, fileName.lastIndexOf('.')) || fileName;
        if (path.input.ext === '') {
            rimraf.sync(path.output.dir.join('/'));
        } else {
            rimraf.sync(path.output.full.replace(/\.[^.]*$/, ext));
            // Recompile if part of the module was removed
            relativeWatched.filter(pathContains(`${path.input.modulePath.join('/')}`)).forEach(compile);
        }
    };

    const on = (watcher, eventType, callback) => watcher.on(eventType, (relativePath) => {
        const inputPath = replaceSlashes(relativePath);
        const watched = relativePaths(watcher.getWatched()).filter(pathMatches(requiredExtensions));

        hook[eventType](inputPath, watched);
        callback(inputPath, watched);
    });
    const watcher = chokidar.watch(patterns, { persistent: watch, cwd: process.cwd() });
    watcher.on('error', hook.error);
    on(watcher, 'unlink', onDeleted);
    on(watcher, 'unlinkDir', onDeleted);
    on(watcher, 'change', compile);
    watcher.on('ready', () => {
        const watched = relativePaths(watcher.getWatched()).filter(pathMatches(requiredExtensions));
        hook.ready(watched);
        watched.forEach(compile);
        on(watcher, 'add', compile);
    });
}