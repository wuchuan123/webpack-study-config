const merge = require("webpack-merge");
const ParallelUglifyPlugin = require("webpack-parallel-uglify-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const genBaseConf = require("./webpack.base.config");
const { prod } = require("../config");
const utils = require("./utils-css");
const genDevConf = (initEnv, argv) => {
  const prodConf = merge({}, genBaseConf(initEnv, argv), {
    mode: argv.mode,
    devtool: "source-map",
    output: {
      filename: "js/[name].[contenthash].js",
    },
    module: {
      rules: utils.styleLoaders({
        sourceMap: false,
        extract: true,
        usePostCSS: true,
      }),
    },
    optimization: {
    // runtimeChunk作用是为了线上更新版本时，充分利用浏览器缓存，使用户感知的影响到最低。
      runtimeChunk: {
        name: "runtime",
      },
      // 按需加载
      // 配置 https://www.webpackjs.com/plugins/split-chunks-plugin/
      splitChunks: {
        chunks: "async",
        cacheGroups: {
          styles: {
            name: "styles",
            test: /\.css$/,
            chunks: "all",
            enforce: true,
          },
          vendor: {
            test: /[\\/](vue|vue-router)/,
            name: "vendor",
            chunks: "initial",
          },
        },
      },
      // 压缩相关
      minimizer: [
        new ParallelUglifyPlugin({ //多进程压缩
          cacheDir: ".cache/",
          sourceMap: true,
          uglifyJS: {
            output: {
              comments: false,
              beautify: false,
            },
            compress: {
              drop_console: true,
              collapse_vars: true,
              reduce_vars: true,
            },
          },
        }),
      ],
    },
  });
  if (prod.BundleAnalyzerPlugin) {
    prodConf.plugins.push(new BundleAnalyzerPlugin({ analyzerPort: 8889 }));
  }
};

module.exports = genDevConf;
