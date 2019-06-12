/**
 * COA PUBLIC LICENSE
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const basePath = '/general';
const handlers = require('./handlers/generalHandlers');

const routes = {
  getAccountDestination: {
    method: 'get',
    path: `${basePath}/accountDestination`,
    options: {
      description:
        'Returns the account destination where the funds will be transferred to',
      summary: 'Get account destination',
      beforeHandler: ['generalAuth'],
      response: {
        200: {
          type: 'object',
          properties: {
            response: { type: 'object' }
          }
        }
      }
    },
    handler: handlers.getAccountDestination
  }
};

module.exports = routes;
