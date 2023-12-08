const { merge } = require('webpack-merge');
const { getCommonConfig } = require('./webpack.common.js');

module.exports = (env, argv) => {
  const isDevEnv = env.name === 'dev';
  const isLocalDevEnv = env.name === 'local-dev';

  const webpackEnv = {
    isDevEnv,
    isLocalDevEnv,
    isProdEnv: !(isDevEnv || isLocalDevEnv),
    name: env.name,
  };

  const envConfigFile = `./webpack.config.${env.name}.js`;
  const coreConfig = getCommonConfig(webpackEnv, argv);
  const envConfig = require(envConfigFile);
  return merge(coreConfig, envConfig);
};
