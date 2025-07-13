export default {
  rootDir: '../',
  setupFiles: ['<rootDir>/test/mock-extension-apis.js'],
  setupFilesAfterEnv: ['<rootDir>/test/setupTests.js'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
    '^.+\\.css$': 'jest-transform-stub'
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(svg|png|jpg|jpeg|gif)$': 'jest-transform-stub'
  },
  testMatch: [
    '<rootDir>/test/**/*.test.js',
    '<rootDir>/test/**/*.test.jsx'
  ],
  moduleFileExtensions: ['js', 'jsx'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.test.{js,jsx}',
    '!src/**/index.js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ]
};
