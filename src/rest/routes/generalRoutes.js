/**
 * AGPL License
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
      beforeHandler: ['generalAuth'],
      schema: {
        description:
          'Returns the account destination where the funds will be transferred to',
        summary: 'Get account destination',
        response: {
          200: {
            type: 'object',
            properties: {
              address: { type: 'string' },
              bank: { type: 'string' },
              owner: { type: 'string' }
            },
            description: 'Returns the account information'
          },
          404: {
            type: 'object',
            properties: {
              error: { type: 'string' }
            },
            description: 'Returns a message describing the error'
          }
        }
      }
    },
    handler: handlers.getAccountDestination
  }
};

module.exports = routes;
