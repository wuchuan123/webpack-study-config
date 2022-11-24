const utils = require("./utils-css");
const isProduction = process.env.NODE_ENV === "production";
const sourceMapEnabled = false;

module.exports = {
  loaders: utils.cssLoaders({
    sourceMap: sourceMapEnabled,
    extract: isProduction,
  }),
  cssSourceMap: sourceMapEnabled,
};
