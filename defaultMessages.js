
exports.defaultMessages = log => ({
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
})