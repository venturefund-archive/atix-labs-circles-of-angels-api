const basePath = '/photos';
const handlers = require('./handlers/photoHandlers');

const routes = {
  getPhoto: {
    method: 'get',
    path: `${basePath}/:id`,
    options: {
      beforeHandler: ['generalAuth'],
      schema: {
        description: 'Serves an existing image encoded in base64',
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
