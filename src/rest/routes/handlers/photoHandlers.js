/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const apiHelper = require('../../services/helper');

module.exports = {
  getPhoto: fastify => async (request, reply) => {
    const { photoService } = apiHelper.helper.services;
    const { id } = request.params;
    fastify.log.info(`[Photo Routes] :: Getting photo ID ${id}`);

    try {
      const res = await photoService.getBase64Photo(id);

      if (res && res.error) {
        fastify.log.error(
          `[Photo Routes] :: Error getting photo ID ${id}:`,
          res.error
        );
        reply.status(res.status).send(res.error);
      } else {
        fastify.log.info('[Photo Routes] :: Serving photo ID', id);

        reply.send(res);
      }
    } catch (error) {
      fastify.log.error(
        `[Photo Routes] :: Error getting photo ID ${id}:`,
        error
      );
      reply.status(500).send({ error: 'Error getting photo' });
    }
  }
};
