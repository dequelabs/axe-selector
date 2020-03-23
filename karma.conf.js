const tsconfig = require('./tsconfig.json')

module.exports = config =>
  config.set({
    frameworks: ['mocha', 'karma-typescript'],
    files: [{ pattern: 'src/**/*.ts' }],
    preprocessors: {
      '**/*.ts': ['karma-typescript']
    },
    reporters: ['spec', 'karma-typescript'],
    browsers: ['Chrome'],

    karmaTypescriptConfig: {
      compilerOptions: {
        ...tsconfig.compilerOptions,
        allowJs: true
      }
    }
  })
