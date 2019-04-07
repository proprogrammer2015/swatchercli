# swatchercli

## Instalation
```sh
npm install swatchercli
```

## Run command
### Help
```sh
swatchercli --help
```
### Single run
```sh
swatchercli -s -o ./output -p ./src/**
```
### Continuous run
```sh
swatchercli -o ./output -p ./src/**
```
### Using json configutaion
```sh
swatchercli -j ./path/to/watcher.config.json
```
### Using js configutaion
```sh
swatchercli -c ./path/to/watcher.config.js
```

## Configuration
### watcher.config.js
```js
const { Html, Js, Css } = require('any-file-merge');

const ext = '[name].html';
exports.watch = true;
exports.quiet = false;
exports.patterns = [
    './src/components/**'
];
exports.output = './output';
exports.fileName = `${ext}`;
exports.processors = [
    new Html(),
    new Js(),
    new Css()
];

exports.hooks = {
    ready: data => console.log(data),
    error: data => console.log(data),
    change: data => console.log(data),
    delete: data => console.log(data),
    add: data => console.log(data),
    compile: data => console.log(data)
}
```
## Licence MIT