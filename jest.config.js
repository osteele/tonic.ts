module.exports = {
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  testPathIgnorePatterns: ['/node_modules/'],
  testMatch: [
    '**/__tests__/**/*.(js|ts)?(x)',
    '**/?(*.)+(spec|test).(js|ts)?(x)'
  ],
  testURL: 'http://localhost/'
};
