module.exports = {
  rootDir: 'src',
  testPathIgnorePatterns: ['<rootDir>/tests/contracts/coa.test.js'],
  collectCoverageFrom: ['<rootDir>/rest/services/**'],
  coveragePathIgnorePatterns: [
    '<rootDir>/rest/services/eth/',
    '<rootDir>/rest/services/cronjob/',
    '<rootDir>/rest/services/helper.js', // not being used anymore
    '<rootDir>/rest/services/helpers/buidlerTasks.js'
  ]
};
