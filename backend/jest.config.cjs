module.exports = {
  transform: {
    '^.+\\.[tj]s$': 'babel-jest',
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  testEnvironment: 'node',
  transformIgnorePatterns: [
    '/node_modules/(?!(sparql-http-client|nanoid|natural|underscore)/)',
  ],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
}; 