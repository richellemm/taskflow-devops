module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.spec.js'],
  transform: {
    '^.+\\.js$': ['babel-jest', { configFile: './backend/babel.config.json' }]
  }
}
