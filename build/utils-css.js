"use strict";
const path = require("path");
const config = require("../config");

// 本插件会将 CSS 提取到单独的文件中，
// 为每个包含 CSS 的 JS 文件创建一个 CSS 文件，并且支持 CSS 和 SourceMaps 的按需加载。
// 作用：打包css代码用的
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const packageConfig = require("../package.json");

const { getDeployName } = require("./utils");
const APP_ID = getDeployName();

exports.cssLoaders = function (options) {
  options = options || {};
  // css-loader 会对 @import 和 url() 进行处理，就像 js 解析 import/require() 一样。
  // css-loader要配合 style-loader使用
  // sass scss less stylus 都需要配合css-loader
  const cssLoader = {
    loader: "css-loader",
    options: {
      sourceMap: options.sourceMap,
    },
  };

  // 新一代的css预处理方案，支持几百种插件。（暂时没发现什么用，用less就可以了）
  const postcssLoader = {
    loader: "postcss-loader",
    options: {
      sourceMap: options.sourceMap,
    },
  };
  function generateLoaders(loader, loaderOptions) {
    const loaders = options.usePostCSS
      ? [cssLoader, postcssLoader]
      : [cssLoader];

    if (loader) {
      loaders.push({
        loader: loader + "-loader",
        options: Object.assign({}, loaderOptions, {
          sourceMap: options.sourceMap,
        }),
      });
    }

    if (options.extract) {
      // extract 判断是否生产环境
      return [MiniCssExtractPlugin.loader].concat(loaders);
    } else {
      // vue-style-loader 与 style-loader 功能一样，都是在Head里面把css插进去
      // vue-style-loader 自带scope,可以开启CSS modules模式，scope和modules模式不能同时用，一般使用scope
      return ["vue-style-loader"].concat(loaders);
    }
  }
  return {
    css: generateLoaders(),
    postcss: generateLoaders(),
    less: generateLoaders("less", { modifyVars: { APP_ID } }),
    sass: generateLoaders("sass", { indentedSyntax: true }),
    scss: generateLoaders("sass"),
    stylus: generateLoaders("stylus"),
  };
};

exports.styleLoaders = function (options) {
  const output = [];
  // exports.cssLoaders  Commonjs exports出去的东西，想要在本文件使用，必须使用exports.cssLoaders
  const loaders = exports.cssLoaders(options);
  for (const extension in loaders) {
    const loader = loaders[extension];
    output.push({
      test: new RegExp("\\." + extension + "$"),
      use: loader,
    });
  }
  return output;
};
