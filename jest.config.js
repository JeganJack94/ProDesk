export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: [
    './jest.setup.js',
    './src/setupTests.js'
  ],
  injectGlobals: true,
  moduleDirectories: ['node_modules', 'src', 'src/tests/__mocks__'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^firebase/(.*)$': '<rootDir>/src/tests/__mocks__/firebase/config.js'
  },
  transform: {
    '^.+\\.(js|jsx)$': ['babel-jest', { configFile: './babel.config.js' }]
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx}',
    '<rootDir>/src/**/*.{spec,test}.{js,jsx}'
  ],
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
  transformIgnorePatterns: [
    'node_modules/(?!(@firebase|firebase)/)'
  ],
  extensionsToTreatAsEsm: ['.jsx'],
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons']
  }
}; 