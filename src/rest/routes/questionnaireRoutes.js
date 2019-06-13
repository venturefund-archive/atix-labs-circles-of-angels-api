/**
 * AGPL License
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
        description:
          'Returns the onboarding questions and their corresponding ' +
          'answers for the specified role',
        summary: 'Get onboarding Q&A',
        params: {
          type: 'object',
          properties: {
            roleId: { type: 'number' }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              questions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    question: { type: 'string' },
                    role: { type: 'number' },
                    answerLimit: { type: 'number' },
                    answers: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          answer: { type: 'string' },
                          id: { type: 'number' },
                          question: { type: 'number' }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          500: {
            type: 'object',
            properties: {
              error: { type: 'string' }
            }
          }
        }
      }
    },
    handler: handlers.getQuestionnaire
  }
};

module.exports = routes;
