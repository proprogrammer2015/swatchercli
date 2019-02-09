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
### watcher.config.json
```json
{
    "isSingleRun": true,
    "patterns": [
        "./src/test/**"
    ],
    "output": "./dist"
}
```

## Licence MIT