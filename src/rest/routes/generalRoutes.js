const basePath = '/general';
const handlers = require('./handlers/generalHandlers');

const routes = {
  getAccountDestination: {
    method: 'get',
    path: `${basePath}/accountDestination`,
    options: {
      description:
        'Returns the account destination where the funds will be transferred to',
      summary: 'Get account destination',
      beforeHandler: ['generalAuth'],
      response: {
        200: {
          type: 'object',
          properties: {
            response: { type: 'object' }
          }
        }
      }
    },
    handler: handlers.getAccountDestination
  }
};

module.exports = routes;
