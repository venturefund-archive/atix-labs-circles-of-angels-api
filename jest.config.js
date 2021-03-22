module.exports = {
  rootDir: 'src',
  testMatch: ['<rootDir>/tests/**/*.js', '<rootDir>/plugins/tests/**/*.js'],
  testPathIgnorePatterns: [
    '<rootDir>/tests/contracts/coa.test.js',
    '<rootDir>/tests/contracts/dao.test.js',
    '<rootDir>/tests/contracts/claimsRegistry.test.js',
    '<rootDir>/tests/contracts/testHelpers.js',
    '<rootDir>/tests/contracts/gasStation.test.js',
    '<rootDir>/tests/contracts/usersWhitelist.test.js',
    '<rootDir>/tests/testHelper.js',
    '<rootDir>/tests/mockModels.js',
    '<rootDir>/tests/mockFiles'
  ],
  collectCoverageFrom: ['<rootDir>/rest/services/**'],
  coveragePathIgnorePatterns: [
    '<rootDir>/rest/services/eth/',
    '<rootDir>/rest/services/cronjob/',
    '<rootDir>/rest/services/helper.js', // not being used anymore
    '<rootDir>/rest/services/helpers/buidlerTasks.js'
  ],
  testTimeout: 60000
};
