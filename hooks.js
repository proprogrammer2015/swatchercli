const colors = require('colors');

const noop = () => { };
const entrypointsDefault = (entrypoints = {}, defaultOutput) => {
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
const print = ({ color, event, message }) => console.log(
    colors.inverse[color](`${event}:`) +
    colors[color](` ${message}`)
);

exports.createHooks = (hooks, isQuiet) => {
    const log = isQuiet ? noop : print;
    const defaultEntrypoints = {
        delete: path => log({
            color: 'grey',
            event: 'removed',
            message: path
        }),
        error: message => log({
            color: 'red',
            event: 'ERROR',
            message
        }),
        compile: (path) => log({
            color: 'green',
            event: 'compiled module',
            message: path.replace(/\.[a-zA-Z0-9]+/, '')
        }),
        change: (path) => log({
            color: 'green',
            event: 'changed',
            message: path
        }),
        add: (path) => log({
            color: 'blue',
            event: 'added',
            message: path
        }),
        ready: () => log({
            color: 'white',
            event: 'STARTED',
            message: 'any-file-merge'
        })
    };

    return entrypointsDefault(hooks, defaultEntrypoints);
}