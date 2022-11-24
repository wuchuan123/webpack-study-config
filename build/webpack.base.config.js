const webpack = require("webpack");
/**
 * 使用 Webpack 时，您可能希望生成包含已生成哈希的捆绑包（用于缓存清除），
 * 就是给dist目录下的文件名加哈希的， 加了哈希之后对缓存有用，哈希值变了就清除缓存，
 * http，会根据文件名和上次是否有变化来缓存，有变化则加载新的。
 * https://www.cnblogs.com/houxianzhou/p/14743591.html
 */
const AssetsWebpackPlugin = require("assets-webpack-plugin");
/**
 * clean-webpack-plugin是一个清除文件的插件。
 * 在每次打包后，磁盘空间会存有打包后的资源，在再次打包的时候，我们需要先把本地已有的打包后的资源清空，
 * 来减少它们对磁盘空间的占用。插件clean-webpack-plugin就可以帮我们做这个事情。
 */
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const VueLoaderPlugin = require("vue-loader/lib/plugin");
/*
https://www.webpackjs.com/plugins/mini-css-extract-plugin#root
本插件会将 CSS 提取到单独的文件中，为每个包含 CSS 的 JS 文件创建一个 CSS 文件，
并且支持 CSS 和 SourceMaps 的按需加载。
就是把css剥离出来，利用浏览器渲染引擎，提高速度。
*/
const MiniCssExtractPlugin=require('mini-css-extract-plugin')

const ESLintPlugin = require("eslint-webpack-plugin");
const { resolvePath, getDeployName } = require("./utils");
let vueLoaderConfig = require("./vue-loader.conf");
const { dev, prod, srcDirName } = require("../config");

module.exports = (initEnv, argv) => {
  const { mode } = argv;
  const envMapping = {
    development: dev,
    production: prod,
  };

  return {
    // 入口，指明Webpack从哪个文件开始构建依赖图，必须
    entry: {
      main: resolvePath("../index.js"),
    },
    // 出口 必须
    output: {
      // 输出文件的名字 必须
      filename: "js/[name].[hash].js",
      // 输出到的目录名 必须
      path: resolvePath("../dist"),
      // 按需加载路径
      publicPath: "/test/", // 相对于服务器
    },
    /* resolve配置模块如何解析，一般用于给文件设置alias，
       extensions：使用户引入模块时不带扩展。
    */
    resolve: {
      alias: {
        "~": resolvePath("../src"),
      },
      extensions: ["*", ".js", ".jsx", ".ts", ".vue", ".json"],
    },
    /* module:通过loader来解析类型不同的模块，处理那些非js的文件，loader通常只在module里使用
       目前只用关注rules这个选项即可，根据规则来确定怎么解析该模块。
    */
    module: {
      rules: [
        {
          // 引入所有通过断言测试的模块
          test: /\.vue$/,
          // 指定该模块使用的loader
          loader: "vue-loader",
          //引入符合以下任何条件的模块
          include: [
            resolvePath(`../${srcDirName}`),
            resolvePath(`../node_modules/view-design`),
          ],
          // options 关于loader的配置选项，选项里面还可以嵌套loader
          // vue-loader 还要解析vue模板文件的css
          options: vueLoaderConfig,
        },
        {
          test: /\.js$/,
          loader: "babel-loader",
          // exclude  排除这个模块
          exclude: [resolvePath("../node_modules/@paic_aiclaim/...")],
          // sideEffects:表明模块的哪一部份包含副作用
          sideEffects: false,
        },
        {
          /* Data URL 内嵌的url
            如果页面图片较多，发很多http请求，会降低页面性能。这个问题可以通过url-loader解决。
            url-loader会将引入的图片编码，生成dataURl并将其打包到文件中，最终只需要引入这个dataURL就能访问图片了。
            当然，如果图片较大，编码会消耗性能。因此url-loader提供了一个limit参数，
            小于limit字节的文件会被转为DataURl，大于limit的还会使用file-loader进行copy
            https://segmentfault.com/a/1190000018987483
            webpack5 弃用该loader
          */
          test: /\.(png|jpe?g|gif)(\?.*)?$/,
          loader: "url-loader",
          options: {
            limit: 10000,
            esModule: false, // 是否启用esModule,默认true
          },
        },
        {
          test: /\.(woff2?|eot|ttf|otf|svg)(\?.*)?$/,
          loader: "url-loader",
          options: {
            limit: 1000,
            esModule: false, // 是否启用esModule,默认true
          },
        },
        {
          // json5-loader 将json文件解析为js对象
          test: /\.json$/,
          loader: "json5-loader",
          type: "javascript/auto",
        },
      ],
    },
    // externals 不打包从外部引入的依赖
    externals: {
      "@paic_aiclaim/http": "paicAiClaimAxiosInstance",
    },
    plugins: [
      // https://www.webpackjs.com/plugins/eslint-webpack-plugin/#root
      new ESLintPlugin({
        contest: resolvePath("../"),
        files: [srcDirName, "packages/src", "pkg-release/src"],
        extensions: ["js", "vue"],
        formatter: require("eslint-friendly-formatter"), //官方的规则
      }),
      // 快捷设置环境变量的方式
      new webpack.EnvironmentPlugin({ ...env }),
      // https://github.com/johnagan/clean-webpack-plugin
      new CleanWebpackPlugin({
        verbose: true, // 将日志写入控制台
        cleanOnceBeforeBuildPatterns: [resolvePath(`../dist/${deployName}`)], //要清除的路径
      }),
      new VueLoaderPlugin(),
      new MiniCssExtractPlugin({
        filename:'css/[name].[contenthash].css', // 此选项决定了输出的每个 CSS 文件的名称
        chunkFilename:'css/[id].[contenthash].css' //此选项决定了非入口的 chunk 文件名称
      }),
      // https://github.com/ztoben/assets-webpack-plugin#usecompilerpath 文档
      new AssetsWebpackPlugin({
        useCompilerPath:true,//重写路径以使用webpack配置中设置的编译器输出路径。
        entrypoints: true // 使用webpack的入口路径
      }),

      //微前端，防止chunk id 和 module id 冲突
      new MicrofeChunkidPlugin({}),
      new MicrofeModuleidPlugin({})
    ],
  };
};
