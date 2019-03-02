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

    const requiredExtensions = processors
        .filter(type => type.isRequired())
        .map(type => `.${type.extension()}`);

    const sc = new SvelteCombine(fs, { output, processors });

    const compile = (sc, relativePath) => {
        try {
            sc.combine(relativePath);
            logSuccess(`${relativePath} was saved`);
        } catch (error) {
            logError(`File ${relativePath} could not be saved due to error: ${error.message}`);
        }
    }

    const onChanged = relativePath => compile(sc, relativePath)

    const onDeleted = relativePath => {
        const { dir, modulePath, name, ext } = resolvePath(relativePath, output);
        const toBeRemoved = `${dir.join('/')}/${name}${ext}`;
        rimraf.sync(toBeRemoved);
        logSuccess(`${toBeRemoved} was deleted`);

        const moduleLeftoverPaths = relativePaths(watcher.getWatched())
            .filter(p => p.indexOf(`${modulePath}/${name}`) !== -1);

        if (moduleLeftoverPaths.length) {
            // Recompile if part of the module was removed
            moduleLeftoverPaths.forEach(relativePath => compile(sc, relativePath));
        }
    };
    const onRelative = callback => filepath => callback(replaceSlashes(filepath));

    const watcher = chokidar.watch(patterns, { persistent: !isSingleRun, cwd: process.cwd() });
    watcher
        .on('add', path => {
            const newRelativePath = replaceSlashes(path);
            const isNew = relativePaths(watcher.getWatched())
                .filter(relativePath => relativePath !== newRelativePath)
                .some(isNew => !!isNew);

            if (isNew) {
                onChanged(newRelativePath);
            }
        })
        .on('change', onRelative(onChanged))
        .on('unlink', onRelative(onDeleted))
        .on('unlinkDir', onRelative(onDeleted))
        .on('error', logError)
        .on('ready', () => relativePaths(watcher.getWatched())
            .filter(matchSome(requiredExtensions))
            .forEach(filepath => compile(sc, filepath))
        );
}