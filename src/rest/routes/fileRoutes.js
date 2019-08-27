/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const basePath = '/files';
const handlers = require('./handlers/fileHandlers');
const routeTags = require('../util/routeTags');

const routes = {
  deleteFile: {
    method: 'delete',
    path: `${basePath}/:fileId`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        tags: [routeTags.FILE.name, routeTags.DELETE.name],
        description: 'Deletes an existing file',
        summary: 'Delete file',
        params: {
          type: 'object',
          properties: {
            fileId: { type: 'integer', description: 'File to delete' }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' }
            },
            description: 'Returns the deleted file object'
          },
          '4xx': {
            type: 'object',
            properties: {
              status: { type: 'number' },
              error: { type: 'string' }
            },
            description: 'Returns a message describing the error'
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
    handler: handlers.deleteFile
  }
};

module.exports = routes;
