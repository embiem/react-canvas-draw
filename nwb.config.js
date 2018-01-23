module.exports = {
  type: 'react-component',
  npm: {
    esModules: true,
    umd: {
      global: 'ReactCanvasDraw',
      externals: {
        react: 'React'
      }
    }
  },
  webpack: {
    rules: {
      css: {
        modules: true,
        localIdentName: '[local]__[hash:base64:5]'
      }
    }
  }
}
