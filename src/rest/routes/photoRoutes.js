/**
 * COA PUBLIC LICENSE
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const basePath = '/photos';
const handlers = require('./handlers/photoHandlers');

const routes = {
  getPhoto: {
    method: 'get',
    path: `${basePath}/:id`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        description: 'Returns an existing image encoded in base64',
        summary: 'Get photo',
        params: {
          id: { type: 'integer' }
        }
      },
      response: {
        200: {
          type: 'image',
          properties: {
            response: { type: 'image' }
          }
        }
      }
    },
    handler: handlers.getPhoto
  }
};

module.exports = routes;
