const basePath = '/general';

const routes = async (fastify, options) => {
  const configsDao = require('../dao/configsDao')({
    configsModel: fastify.models.configs
  });
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
