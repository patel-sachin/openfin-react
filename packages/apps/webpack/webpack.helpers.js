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
const sciChartWasmPath = path.resolve(__dirname, '../../..', 'node_modules/scichart/_wasm');
const buildDir = path.resolve(__dirname, '../../../dist/apps');
const publicPath = path.resolve(__dirname, '../public');
console.log(`       __dirname: ${__dirname}`);
console.log(`          public: ${publicPath}`);
console.log(`         srcPath: ${srcPath}`);
console.log(`commonPublicPath: ${commonPublicPath}`);
console.log(`   commonSrcPath: ${commonSrcPath}`);
console.log(`commonStylesPath: ${commonStylesPath}`);
console.log(`sciChartWasmPath: ${sciChartWasmPath}`);
console.log(`        buildDir: ${buildDir}`);

const htmlTemplate = path.resolve(commonPublicPath, 'template.html');

const newComponent = (options = {}) => {
  const { entryName = '', entryFile = '', outputFile = '', title = '', appsRootPath = './' } = options;

  return {
    htmlTemplate,
    entryName,
    appsRootPath,
    title: title || entryName,
    path: path.resolve(srcPath, entryFile),
    filename: outputFile || `${entryName}.html`,
  };
};

const components = [
  newComponent({
    entryName: 'demo-app',
    title: 'Demo App',
    entryFile: 'Demo/DemoApp.tsx',
  }),
];

const getEntries = () => {
  return components.reduce((acc, current) => {
    acc[current.entryName] = current.path;
    return acc;
  }, {});
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
            filename: current.filename,
            template: current.htmlTemplate,
            appsRootPath: current.appsRootPath,
            title: current.title,
            scriptLoading: 'module',
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
    splitChunks: {
      chunks: 'all',
    },
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
  const patterns = [];
  patterns.push({
    from: path.resolve(publicPath, '../../common/public', 'config.js'),
    to: 'config.js',
    info: { minimized: true },
  });

  return patterns;
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
      patterns: [...getFileCopyPatterns(webpackEnv)],
    }),

    new CleanWebpackPlugin({
      protectWebpackAssets: false,
      cleanAfterEveryBuildPatterns: ['**/*.LICENSE.txt'],
    }),
  ];

  if (webpackEnv.isLocalDevEnv) {
    rv.push(new ReactRefreshWebpackPlugin());
  }

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
      include: [srcPath, commonStylesPath, publicPath],
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