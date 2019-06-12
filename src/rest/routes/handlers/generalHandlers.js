/**
 * COA PUBLIC LICENSE
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

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
