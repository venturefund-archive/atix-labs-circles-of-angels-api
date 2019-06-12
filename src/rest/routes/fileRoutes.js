/**
 * COA PUBLIC LICENSE
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const basePath = '/files';
const handlers = require('./handlers/fileHandlers');

const routes = {
  deleteFile: {
    method: 'delete',
    path: `${basePath}/:id`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        description: 'Deletes an existing file',
        summary: 'Delete file',
        params: {
          type: 'object',
          properties: {
            id: { type: 'number' }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' }
            }
          },
          '4xx': {
            type: 'object',
            properties: {
              status: { type: 'number' },
              error: { type: 'string' }
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
    handler: handlers.deleteFile
  }
};

module.exports = routes;
