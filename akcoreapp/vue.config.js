const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    https:false,
    headers: { "Content-Security-Policy": "frame-src *" }

  },
  publicPath: process.env.NODE_ENV === 'production'
  ? '/adminpanel/'
  : '/',
  outputDir: '/var/www/html/akcore/dist'
})
