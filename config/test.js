/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

module.exports = {
  fileServer: {
    filePath: require('path').join(__dirname, '../src/tests/mockFiles'),
    maxFileSize: 5000000
  },
  buidler: {
    defaultNetwork: 'develop'
  },
  frontendUrl: '//test',
  crypto: {
    key: '3c50cffcdce9a802a26f5293aa4dc689' // added to run tests
  },
  crons: {
    checkContractBalancesJob: {
      balancesConfig: {
        gsnAccountThreshold: '50',
        email: 'a@fake.email',
        default: {
          targetBalance: '1',
          balanceThreshold: '5'
        },
        coa: {
          targetBalance: '5',
          balanceThreshold: '50'
        },
        projects: {
          targetBalance: '10',
          balanceThreshold: '50'
        },
        daos: {
          targetBalance: '100',
          balanceThreshold: '100'
        }
      }
    }
  }
};
