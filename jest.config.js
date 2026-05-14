/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ['js', 'jsx', 'json', 'node', 'ts', 'tsx'],
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    '**/__tests__/**/*.(js|ts)?(x)',
    '**/?(*.)+(spec|test).(js|ts)?(x)',
  ],
  testPathIgnorePatterns: ['./dist/', '/node_modules/'],
  watchman: false,
};
