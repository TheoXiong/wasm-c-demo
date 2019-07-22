# wasm-c-demo

简体中文 | [English](./README.md)

[wasm-c-demo](https://github.com/TheoXiong/wasm-c-demo) 是一个 简单的 C WASM 示例，
主要演示了Js调用C函数，通过emscripten API模拟出与C匹配的各种指针类型，通过指针传递数据。

## 使用

### 安装 Emscripten 
首先需要安装emscripten编译器, 安装方法可查看 [安装手册](https://emscripten.org/docs/getting_started/index.html)

### 运行示例
安装node modules
```
npm install
```

将C代码编译成webassembly
```
npm run build 
```

在Node环境运行示例
```
npm run dist
```

在浏览器环境运行示例
```
npm run html
```