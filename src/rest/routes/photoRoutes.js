const basePath = '/photos';
const handlers = require('./handlers/photoHandlers');

const routes = {
  getPhoto: {
    method: 'get',
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
