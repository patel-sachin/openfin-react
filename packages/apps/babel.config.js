const presets = [
  '@babel/preset-env',
  [
    '@babel/preset-react',
    {
      runtime: 'automatic',
    },
  ],
  '@babel/preset-typescript',
];

const plugins = ['macros'];

module.exports = { presets, plugins };
