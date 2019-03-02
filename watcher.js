const chokidar = require('chokidar');
const color = require('colors');
const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');
const { SvelteCombine, Html, Js, Css } = require('svelte-module-combine');
const { resolvePath } = require('corresponding-path');

const replaceSlashes = pathString => `./${pathString.split(/[\\\/]/).join('/')}`;
const matchSome = extList => filepath => extList.some(ext => ext === path.extname(filepath));
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
        isSingleRun,
        patterns,
        output,
        debug,
        processors = defaultProcessors
    }
) => {
    const logSuccess = text => {
        if (debug) {
            console.log(color.green(text));
        }
    };
    const logError = error => {
        if (debug) {
            console.log(color.red(`Error: ${error}`));
        }
    };

    const requiredExtensions = mapRequiredProcessors(processors);

    const sc = new SvelteCombine(fs, { output, processors });
    const compile = relativePath => {
        try {
            sc.combine(relativePath);
            logSuccess(`${relativePath} was saved`);
        } catch (error) {
            logError(`File ${relativePath} could not be saved due to error: ${error.message}`);
        }
    };

    const onDeleted = relativePath => {
        const { dir, modulePath, name, ext } = resolvePath(relativePath, output);
        const toBeRemoved = `${dir.join('/')}/${name}${ext}`;
        rimraf.sync(toBeRemoved);
        logSuccess(`${toBeRemoved} was deleted`);

        // Recompile if part of the module was removed
        relativePaths(watcher.getWatched())
            .filter(path => path.indexOf(`${modulePath}/${name}`) !== -1)
            .forEach(compile);
    };
    const onRelative = callback => filepath => callback(replaceSlashes(filepath));

    const onAdd = newRelativePath => {
        const isNew = relativePaths(watcher.getWatched())
            .some(relativePath => relativePath !== newRelativePath);

        if (isNew) {
            compile(newRelativePath);
        }
    };
    const watcher = chokidar.watch(patterns, { persistent: !isSingleRun, cwd: process.cwd() });
    watcher
        .on('change', onRelative(compile))
        .on('unlink', onRelative(onDeleted))
        .on('unlinkDir', onRelative(onDeleted))
        .on('error', logError)
        .on('ready', () => {
            relativePaths(watcher.getWatched())
                .filter(matchSome(requiredExtensions))
                .forEach(compile);

            watcher.on('add', onRelative(onAdd));
        });
}