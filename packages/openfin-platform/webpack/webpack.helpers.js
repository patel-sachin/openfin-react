const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const srcPath = path.resolve(__dirname, '..', 'src');
const commonPublicPath = path.resolve(__dirname, '..', '..', 'common/public');
const commonSrcPath = path.resolve(__dirname, '..', '..', 'common/src');
const commonStylesPath = path.resolve(__dirname, '..', '..', 'common/styles');
const buildDir = path.resolve(__dirname, '../../../dist/fin');
const publicPath = path.resolve(__dirname, '../public');
console.log(`       __dirname: ${__dirname}`);
console.log(`           public: ${publicPath}`);
console.log(`          srcPath: ${srcPath}`);
console.log(`commonPublicPath: ${commonPublicPath}`);
console.log(`   commonSrcPath: ${commonSrcPath}`);
console.log(`commonStylesPath: ${commonStylesPath}`);
console.log(`         buildDir: ${buildDir}`);

const htmlTemplate = path.resolve(commonPublicPath, 'template.html');

const components = [
  {
    entryName: 'provider',
    path: path.resolve(srcPath, 'platformprovider/provider.ts'),
    htmlTemplate: path.resolve(publicPath, 'provider.html'),
    appsRootPath: './',
  },
  {
    entryName: 'platform',
    path: path.resolve(srcPath, 'components/Platform.tsx'),
    htmlTemplate: path.resolve(publicPath, 'platform.html'),
    appsRootPath: './',
  },
];

const getEntries = () => {
  const appEntries = components.reduce((acc, current) => {
    acc[current.entryName] = current.path;
    return acc;
  }, {});

  return Object.assign(
    {
      vendor: ['react', 'react-dom', 'lodash'],
    },
    appEntries,
  );
};

const getHtmlGenerators = (webpackEnv) =>
  components.reduce((acc, current) => {
    acc.push(
      new HtmlWebpackPlugin(
        Object.assign(
          {},
          {
            inject: true,
            chunks: [current.entryName],
            filename: `${current.entryName}.html`,
            template: current.htmlTemplate,
            appsRootPath: current.appsRootPath,
            scriptLoading: 'module',
            title: `${current.entryName}`,
            showErrors: true,
          },
          webpackEnv.isDevEnv || webpackEnv.isLocalDevEnv
            ? undefined
            : {
                minify: {
                  removeComments: true,
                  collapseWhitespace: true,
                  removeRedundantAttributes: true,
                  useShortDoctype: true,
                  removeEmptyAttributes: true,
                  removeStyleLinkTypeAttributes: true,
                  keepClosingSlash: true,
                  html5: false,
                  minifyJS: true,
                  minifyCSS: true,
                  minifyURLs: false,
                },
              },
        ),
      ),
    );
    return acc;
  }, []);

const getOutput = (webpackEnv) => {
  return {
    pathinfo: webpackEnv.isDevEnv || webpackEnv.isLocalDevEnv,

    filename:
      webpackEnv.isDevEnv || webpackEnv.isLocalDevEnv
        ? 'static/js/[name].bundle.js'
        : 'static/js/[name].[contenthash:8].bundle.js',

    chunkFilename:
      webpackEnv.isDevEnv || webpackEnv.isLocalDevEnv
        ? 'static/js/[name].chunk.js'
        : 'static/js/[name].[contenthash:8].chunk.js',

    assetModuleFilename: 'static/media/[name].[hash][ext]',

    path: buildDir,
    clean: true,
  };
};

const getOptimizations = (webpack) => {
  return {
    minimize: webpack.isProdEnv,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          parse: {
            ecma: 8,
          },
          compress: {
            ecma: 5,
            warnings: false,
            comparisons: false,
            inline: 2,
          },
          mangle: {
            safari10: true,
          },
          keep_classnames: webpack.isProdEnv,
          keep_fnames: webpack.isProdEnv,
          output: {
            ecma: 5,
            comments: false,
            ascii_only: true,
          },
        },
      }),
    ],
  };
};

const getResolves = () => {
  return {
    modules: [
      'node_modules',
      path.resolve(srcPath, '..', 'node_modules'),
      path.resolve(buildDir, '..', 'node_modules'),
    ],
    extensions: [
      '.web.mjs',
      '.mjs',
      '.web.js',
      '.js',
      '.web.ts',
      '.ts',
      '.web.tsx',
      '.tsx',
      '.json',
      '.web.jsx',
      '.jsx',
    ],
    alias: {
      ...(webpack.isProdEnv && {
        'react-dom$': 'react-dom/profiling',
        'scheduler/tracing': 'scheduler/tracing-profiling',
      }),
    },
  };
};

const getFileCopyPatterns = (webpackEnv) => {
  const patterns = [
    {
      from: path.resolve(publicPath, 'favicon.ico'),
      to: '',
      info: { minimized: true },
    },
    {
      from: path.resolve(publicPath, '../../common/public', 'config.js'),
      to: 'config.js',
      info: { minimized: true },
    },
    {
      from: path.resolve(publicPath, 'openfinreact.app.json'),
      to: 'openfinreact.app.json',
      info: { minimized: true },
    },
    {
      from: path.resolve(publicPath, 'version.json'),
      to: '',
      transform(buffer) {
        const versionInfo = JSON.parse(buffer.toString());
        versionInfo.version = getBuildVersion();
        return Buffer.from(JSON.stringify(versionInfo, null, 2));
      },
    },
  ];

  return patterns;
};

const getBuildVersion = () => {
  const major = process.env.E7_MAJOR || 0;
  const minor = process.env.E7_MINOR || 0;
  const patch = process.env.E7_BUILD_NUMBER || 0;
  if (major || minor || patch) {
    return `${major}.${minor}.${patch}`;
  }
  return 'development';
};

const getPlugins = (webpackEnv) => {
  const rv = [
    ...getHtmlGenerators(webpackEnv),

    new MiniCssExtractPlugin({
      filename: webpackEnv.isProdEnv ? 'static/css/[name].[contenthash:8].css' : 'static/css/[name].css',
      chunkFilename: webpackEnv.isProdEnv
        ? 'static/css/[name].[contenthash:8].chunk.css'
        : 'static/css/[name].chunk.css',
    }),

    new ForkTsCheckerWebpackPlugin({
      async: false,
    }),

    new webpack.ProgressPlugin({
      activeModules: true,
      entries: true,
      modules: true,
      dependencies: true,
    }),

    new CopyPlugin({
      patterns: getFileCopyPatterns(webpackEnv),
    }),

    new CleanWebpackPlugin({
      protectWebpackAssets: false,
      cleanAfterEveryBuildPatterns: ['**/*.LICENSE.txt'],
    }),
  ];

  if (webpackEnv.isLocalDevEnv) {
    rv.push(new ReactRefreshWebpackPlugin());
  }

  rv.push(new webpack.DefinePlugin({ 'process.env.name': JSON.stringify(`define-plugin-${webpackEnv.name}`) }));

  return rv;
};

const getModuleRules = (webpackEnv) => {
  const rules = [
    {
      enforce: 'pre',
      exclude: [/@babel(?:\/|\\{1,2})runtime/],
      test: /\.(js|mjs|jsx|ts|tsx|css)$/,
      loader: require.resolve('source-map-loader'),
    },
    {
      test: /\.(ts|js)x?$/,
      include: [srcPath, commonSrcPath],
      exclude: [/node_modules/],
      use: [
        {
          loader: 'babel-loader',
        },
      ],
    },
    {
      test: /\.module\.(scss|css)$/,
      use: [
        webpackEnv.isProdEnv ? MiniCssExtractPlugin.loader : 'style-loader',
        {
          loader: 'css-loader',
          options: {
            modules: true,
            sourceMap: webpackEnv.isDevEnv || webpackEnv.isLocalDevEnv,
          },
        },
        {
          loader: 'sass-loader',
          options: {
            sourceMap: webpackEnv.isDevEnv || webpackEnv.isLocalDevEnv,
          },
        },
      ],
    },
    {
      test: /\.(scss|css)$/,
      exclude: /\.module\.(scss|css)$/,
      use: [
        webpackEnv.isProdEnv ? MiniCssExtractPlugin.loader : 'style-loader',
        {
          loader: 'css-loader',
          options: {
            sourceMap: webpackEnv.isDevEnv || webpackEnv.isLocalDevEnv,
          },
        },
        {
          loader: 'sass-loader',
          options: {
            sourceMap: webpackEnv.isDevEnv || webpackEnv.isLocalDevEnv,
          },
        },
      ],
    },
    {
      test: /\.(?:ico|gif|png|jpg|jpeg)$/i,
      include: [srcPath, commonStylesPath],
      type: 'asset/resource',
    },
    {
      test: /\.(woff(2)?|eot|ttf|otf|svg|)$/,
      include: [srcPath, commonStylesPath],
      type: 'asset/inline',
    },
  ];

  return {
    strictExportPresence: true,
    rules: rules,
  };
};

module.exports = {
  getEntries,
  getHtmlGenerators,
  getOutput,
  getOptimizations,
  getResolves,
  getPlugins,
  getModuleRules,
};
