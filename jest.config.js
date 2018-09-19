module.exports = {
  // Enable TypeScript
  moduleFileExtensions: ['js', 'jsx', 'json', 'node', 'ts', 'tsx'],
  transform: { '^.+\\.tsx?$': 'ts-jest' },
  // Where are the test files?
  testMatch: [
    '**/__tests__/**/*.(js|ts)?(x)',
    '**/?(*.)+(spec|test).(js|ts)?(x)'
  ],
  testPathIgnorePatterns: ['./dist/', '/node_modules/']
};
