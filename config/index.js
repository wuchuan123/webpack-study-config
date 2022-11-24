const merge = require("webpack-merge");
module.exports={
    dev:merge({port:3005},{env:devEnv}),
    prod:{}
}