# wasm-c-demo

English | [简体中文](./README.zh-CN.md)

[wasm-c-demo](https://github.com/TheoXiong/wasm-c-demo) is a simple C WASM demo,
Mainly demonstrates that Js calls C functions, emulates various types pointer that match C pointer through the emscripten API, and passes data through the pointer.

## Usage

### Install Emscripten 
First you need to install emscripten toolchain, see [Getting Started](https://emscripten.org/docs/getting_started/index.html)

### Run Demo
Install node modules
```
npm install
```

Build c to webassembly
```
npm run build 
```

run the demo on Node
```
npm run dist
```

run the demo on browser
```
npm run html
```