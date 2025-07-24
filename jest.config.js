export default {
  transform: {
    '^.+\\.m?js$': 'babel-jest',
  },
  testEnvironment: 'node',
  transformIgnorePatterns: ['node_modules/(?!(axios|axios-retry|chalk|boxen|conf)/)'],
  moduleFileExtensions: ['js', 'mjs'],
}
