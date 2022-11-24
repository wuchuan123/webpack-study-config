// 引入nodejs path模块
// require 是nodejs Commonjs 模块的内容，主要用于读取js json文件内容,其他文件不可读取。
// 其中js文件只能读取export的内容
const path = require("path");
const exports = require("webpack");
const packageConfig = require("../package.json");

// __dirname  执行这个语句的当前目录名
// path.resolve([...path]) 组合后，返回文件的绝对路径，自动去掉尾部的 '/'
exports.resolvePath = function resolvePath(fileName) {
  return path.resolve(__dirname, fileName);
};

// 获取项目名，多个项目合在一起的时候有用
const getDeployName = function () {
  return packageConfig.name;
};

exports.getDeployName = getDeployName;

exports.name = getDeployName();
