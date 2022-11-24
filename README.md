## 本项目是一个原生webpack搭建的 vue 的项目，仅供参考。
原生webpack就是很繁琐，直接使用官方vue cli是最好的。react 也同理。


### webpack 快速开始
https://webpack.docschina.org/guides/getting-started
术语：
模块：其实就是文件。

### node 一些语法
```node

```
### vue-loader 配置
https://vue-loader.vuejs.org/zh

1. 和项目架构有关的插件（工具），都会有 xxx.config.js 文件来配置，比如 vue loader，webpack，babel 等。
2. webpack主要是俩个点，开发时的配置和需要的插件（编译你的vue文件到浏览器，等等），和打包到生产的配置，需要的插件（压缩，使文件尽可能小，剥离css html js 等等）