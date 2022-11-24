// 每当您需要在webpack中合并配置项的时候使用这个。很方便，遇到函数时会自动执行函数。
const merge = require("webpack-merge");
// 将已存在的单个文件或整个目录复制到生成目录
// https://www.webpackjs.com/plugins/copy-webpack-plugin#root
// https://www.jiangruitao.com/webpack/copy-webpack-plugin/
// 插件copy-webpack-plugin是用来复制文件的。在我们使用Webpack的时候，有一些本地资源，
// 例如图片和音视频，在打包过程中没有任何模块使用到它们，但我们却想要把它们放在打包后的资源输出目录。
const CopyWebpackPlugin = require("copy-webpack-plugin");
// 在打包结束后，⾃动生成⼀个 html ⽂文件，并把打包生成的js 模块引⼊到该 html 中,给浏览器用
// 这个插件如果你是单项目的话，就放webpack.base.config里面，生产也要用，如果是多个项目集成，就放这里。
const HtmlWebpackPlugin = require("html-webpack-plugin");
const genBaseConf = require("./webpack.base.config");
const { resolvePath, getDeployName } = require("./utils");
const { dev, proxyTable, srcDirName } = require("../config");
const utils = require("./utils-css");
const deployName = getDeployName();

// webpack-dev-server https://www.webpackjs.com/api/webpack-dev-server/#root
// https://webpack.docschina.org/configuration/dev-server/
// 函数写法，可以动态传入模式
const genDevConf = (initEnv, argv) =>
  merge(genBaseConf(initEnv, argv), {
    // 使用什么模式 https://v4.webpack.js.org/configuration/mode/
    mode: argv.mode,
    /* https://juejin.cn/post/7016510600960278565#heading-7
    现代的前端开发总是伴随的各种框架， 在使用这些框架开发的代码需要经过编译才可以在生产环节使用， 
    编译后就伴随着可读性的降低，也会影响我们的错误调试。
    那source map就是为了解决这个问题。
    Source map可以理解为一个地图， 通过它可以获知编译后的代码 对应编译前的代码位置。
    这样当代码遇到异常， 我们就可以通过报错信息定位至准确的位置。 同时在浏览器 sources 也可以查看到源码。
    */
    devtool: "source-map",
    entry: {
      platform: resolvePath("./boot.js"),
    },
    // 引入的模块
    module: {
      rules: utils.styleLoaders({
        sourceMap: false,
        usePostCSS: true,
      }),
    },
    devServer: {
      //告诉服务器从何处提供内容
      contentBase: resolvePath("../dist"),
      port: dev.port, //告诉连接到 devServer 的客户端使用提供的端口进行连接
      hot: true, //启用 webpack 的 热模块替换 特性
      host: "0.0.0.0", //指定要使用的 host
      //当使用内联模式并代理开发服务器时，内联客户端脚本并不总是知道要连接到哪里。
      // 它将尝试根据窗口猜测服务器的URL。位置，但如果失败，则需要使用此选项。
      // webpack5没这个属性
      public: `http://localhost:${dev.port}`,
      /*代理，当拥有单独的 API 后端开发服务器并且希望在同一域上发送 API 请求时，代理某些 URL 可能会很有用。
       配置 https://github.com/chimurai/http-proxy-middleware#options
      */
      proxy: proxyTable,
      open: true, //告诉 dev-server 在服务器已经启动后打开浏览器。设置其为 true 以打开你的默认浏览器。
      overlay: true, // 当出现编译错误或警告时，在浏览器中显示全屏覆盖
      writeToDisk: true,
      historyApiFallback: {
        //使用html5 history Api 时的处理
        rewrites: [
          { from: /^\/$/, to: `/${deployName}/index.html` },
          { from: /^\/.*$/, to: `/${deployName}/index.html` },
        ],
      },
    },
    plugins: [
      new CopyWebpackPlugin(
        [
          {
            from: resolvePath("../static"),
            to: "",
            ignore: [".*"],
          },
        ],
        {
          copyUnmodified: true,
        }
      ),
      new HtmlWebpackPlugin({
        filename: "index.html",
        template: `${srcDirName}/assets/template/index.ejs`,
        favicon: resolvePath(`../${srcDirName}/assets/images/favicon.ico`),
        inject: true,
        chunks: ["runtime", "platform", "vendor"],
      }),
    ],
  });
module.exports = genDevConf;
