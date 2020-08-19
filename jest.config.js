module.exports = {
  rootDir: 'src',
  testMatch: ['<rootDir>/tests/**/*.js', '<rootDir>/plugins/tests/**/*.js'],
  testPathIgnorePatterns: [
    '<rootDir>/tests/contracts/coa.test.js',
    '<rootDir>/tests/mockModels.js',
    '<rootDir>/tests/testHelper.js',
    '<rootDir>/tests/mockFiles'
  ],
  collectCoverageFrom: ['<rootDir>/rest/services/**'],
  coveragePathIgnorePatterns: [
    '<rootDir>/rest/services/eth/',
    '<rootDir>/rest/services/cronjob/',
    '<rootDir>/rest/services/helper.js', // not being used anymore
    '<rootDir>/rest/services/helpers/buidlerTasks.js'
  ],
  testTimeout: 30000
};
