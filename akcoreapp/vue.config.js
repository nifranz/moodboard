const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    https:true
  },
  publicPath: process.env.NODE_ENV === 'production'
  ? '/test/'
  : '/'
})
