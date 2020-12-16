/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const cronExpressions = require('../src/rest/services/cronjob/cronExpressions');

module.exports = {
  server: {
    isHttps: true,
    domain: 'frontend.uat.coa.atixlabs.xyz'
  },
  crons: {
    disableAll: false,
    transitionProjectStatusJob: {
      cronTime: cronExpressions.EVERY_FIVE_MINUTES,
      disabled: false,
      runOnInit: false,
      timezone: undefined
    }
  },
  defaultProjectTimes: {
    minimumUnit: 'seconds',
    consensusSeconds: 300,
    fundingSeconds: 300
  },
  buidler: {
    defaultNetwork: 'testnet'
  }
};
