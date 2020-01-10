/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const basePath = '/milestones';

const milestoneService = require('../../services/milestoneService');

module.exports = {
  getMilestones: () => async (request, reply) => {
    const milestones = await milestoneService.getAllMilestones();
    reply.status(200).send(milestones);
  },
  createMilestone: () => async (request, reply) => {
    const { projectId } = request.params;
    const milestoneParams = request.body;
    const userId = request.user.id;
    const response = await milestoneService.createMilestone(projectId, {
      userId,
      milestoneParams
    });
    reply.status(200).send(response);
  },
  updateMilestone: () => async (request, reply) => {
    const { milestoneId } = request.params;
    const milestoneParams = request.body;
    const userId = request.user.id;
    const response = await milestoneService.updateMilestone(milestoneId, {
      userId,
      milestoneParams
    });
    reply.status(200).send(response);
  },
  deleteMilestone: () => async (request, reply) => {
    const { milestoneId } = request.params;
    const userId = request.user.id;
    const response = await milestoneService.deleteMilestone(
      milestoneId,
      userId
    );
    reply.status(200).send(response);
  },

  getBudgetStatus: fastify => async (req, reply) => {
    fastify.log.info(
      `[Milestone Routes] :: GET request at ${basePath}/budgetStatus`
    );
    try {
      const budgetStatus = await milestoneService.getAllBudgetStatus();
      reply.status(200).send({ budgetStatus });
    } catch (error) {
      fastify.log.error(
        '[Milestone Routes] :: Error getting all available budget transfer status: ',
        error
      );
      reply.status(500).send({
        error: 'Error getting all available budget transfer status'
      });
    }
  }
};
