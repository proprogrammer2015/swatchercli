# swcli

## Instalation
```sh
npm install swcli
```

## Run command
### Help
```sh
swcli --help
```
### Single run
```sh
swcli -s -o ./output -p ./src/**
```
### Continuous run
```sh
swcli -o ./output -p ./src/**
```
### Using json configutaion
```sh
swcli -j ./path/to/watcher.config.json
```
### Using js configutaion
```sh
swcli -c ./path/to/watcher.config.js
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