module.exports = (options, webpack) => {
  return {
    ...options,
    entry: './src/main.ts',
    externals: [],
    output: {
      ...options.output,
      filename: 'main.js',
    },
  };
};
