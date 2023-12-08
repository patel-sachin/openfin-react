const {
  getEntries,
  getOutput,
  getPlugins,
  getModuleRules,
  getOptimizations,
  getResolves,
} = require('./webpack.helpers');

const getCommonConfig = (webpackEnv, argv) => {
  return {
    target: ['browserslist'],
    mode: webpackEnv.isLocalDevEnv || webpackEnv.isDevEnv ? 'development' : 'production',
    entry: getEntries(),
    output: getOutput(webpackEnv),
    optimization: getOptimizations(webpackEnv),
    resolve: getResolves(),
    performance: false,
    plugins: getPlugins(webpackEnv),
    module: getModuleRules(webpackEnv),
    stats: {
      preset: 'minimal',
      env: true,
      entrypoints: true,
      warnings: true,
      errors: true,
      errorDetails: true,
      errorStack: true,
    },
  };
};

module.exports = {
  getCommonConfig: getCommonConfig,
};
