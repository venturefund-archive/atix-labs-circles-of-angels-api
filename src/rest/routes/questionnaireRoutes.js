/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const basePath = 'questionnaire';
const handlers = require('./handlers/questionnaireHandlers');
const routeTags = require('../util/routeTags');

const routes = {
  getQuestionnaire: {
    method: 'get',
    path: `/roles/:roleId/${basePath}`,
    options: {
      schema: {
        tags: [routeTags.QUESTIONNAIRE.name, routeTags.GET.name],
        description:
          'Returns the onboarding questions and their corresponding ' +
          'answers for the specified role',
        summary: 'Get onboarding Q&A',
        params: {
          type: 'object',
          properties: {
            roleId: {
              type: 'number',
              description: 'Role to get the questionnaire from'
            }
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
                    id: { type: 'integer' },
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
            },
            description:
              'Returns an array of questions and their corresponding answers'
          },
          500: {
            type: 'object',
            properties: {
              error: { type: 'string' }
            },
            description: 'Returns a message describing the error'
          }
        }
      }
    },
    handler: handlers.getQuestionnaire
  }
};

module.exports = routes;
