/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

module.exports = {
  fileServer: {
    filePath: require('path').join(__dirname, '../src/tests/mockFiles')
  },
  buidler: {
    defaultNetwork: 'buidlerevm'
  },
  fileServer: {
    maxFileSize: 500000
  },
  frontendUrl: '//test'
};
