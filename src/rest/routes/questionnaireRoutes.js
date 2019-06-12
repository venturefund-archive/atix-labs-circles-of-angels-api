/**
 * COA PUBLIC LICENSE
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const basePath = '/questionnaire';
const handlers = require('./handlers/questionnaireHandlers');

const routes = {
  getQuestionnaire: {
    method: 'get',
    path: `${basePath}/:roleId`,
    options: {
      schema: {
        params: {
          roleId: { type: 'integer' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            response: { type: 'object' }
          }
        }
      }
    },
    handler: handlers.getQuestionnaire
  }
};

module.exports = routes;
