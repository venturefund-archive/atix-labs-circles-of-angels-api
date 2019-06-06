const basePath = '/files';
const handlers = require('./handlers/fileHandlers');

const routes = {
  deleteFile: {
    method: 'delete',
    path: `${basePath}/:id`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        params: {
          id: { type: 'integer' }
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
    handler: handlers.deleteFile
  }
};

module.exports = routes;
