const colors = require('colors');
const { defaultMessages } = require('./defaultMessages');

const noop = () => { };
const print = ({ color, event, message }) => console.log(
    colors.inverse[color](`${event}:`) +
    colors[color](` ${message}`)
);
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

exports.createHooks = (hooks, isQuiet) => {
    const log = isQuiet ? noop : print;
    const defaultHooks = defaultMessages(log);
    return entrypointsDefault(hooks, defaultHooks);
}