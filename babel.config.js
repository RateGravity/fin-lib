module.exports = {
  presets: [
    '@babel/preset-typescript',
    [
      '@babel/preset-env',
      {
        targets: '>1%, last 4 versions, Firefox ESR, not ie < 9, maintained node versions'
      }
    ]
  ],
  plugins: ['@babel/plugin-proposal-class-properties']
};
