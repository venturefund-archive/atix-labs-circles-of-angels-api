const apiHelper = require('../../services/helper');

module.exports = {
  getAccountDestination: fastify => async (request, reply) => {
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
};
