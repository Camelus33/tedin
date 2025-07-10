module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  transform: {
    '^.+\.m?tsx?$': ['ts-jest', { useESM: true }],
    '^.+\.jsx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(nanoid|natural|@rdfjs/data-model|underscore)/)'
  ],
  testMatch: ['<rootDir>/src/**/*.test.ts'],
};