const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    https:false
  },
  publicPath: process.env.NODE_ENV === 'production'
  ? '/adminpanel/'
  : '/'
})
