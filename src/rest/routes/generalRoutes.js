const basePath = '/general';
const apiHelper = require('../services/helper');

const routes = async (fastify, options) => {
  fastify.get(
    `${basePath}/accountDestination`,
    {
      response: {
        200: {
          type: 'object',
          properties: {
            response: { type: 'object' }
          }
        }
      }
    },
    async (request, reply) => {
      const { configsDao } = apiHelper.helper.daos;
      fastify.log.info('[General Routes] :: Getting bank account of COA');
      const account = await configsDao.getCoaBankAccount();
      if (!account)
        reply.send({
          error:
            'Can not provide the requested information, please try again later.'
        });

      reply.send({
        bankAccount: account.value
      });
    }
  );
};

module.exports = routes;
