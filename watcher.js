const chokidar = require('chokidar');
const color = require('colors');
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

    const remove = filepath => {
        rimraf.sync(filepath);
        logSuccess(`${filepath} was deleted`);
    };

    const onDeleted = relativePath => {
        const { dirStr, modulePath, name, ext } = resolvePath(relativePath, output);
        remove(`${dirStr}/${name}${ext}`);
        // Recompile if part of the module was removed
        compileAllIf(pathContains(`${modulePath}/${name}`));
    };

    const compileAllIf = condition => {
        relativePaths(watcher.getWatched())
            .filter(condition)
            .forEach(compile);
    };

    const onRelative = callback => filepath => callback(replaceSlashes(filepath));
    
    const watcher = chokidar.watch(patterns, { persistent: !isSingleRun, cwd: process.cwd() });
    watcher
        .on('change', onRelative(compile))
        .on('unlink', onRelative(onDeleted))
        .on('unlinkDir', onRelative(onDeleted))
        .on('error', logError)
        .on('ready', () => {
            compileAllIf(pathMatches(requiredExtensions));
            watcher.on('add', onRelative(compile));
        });
}