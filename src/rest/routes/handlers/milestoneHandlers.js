/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const basePath = '/milestones';

const milestoneService = require('../../services/milestoneService');
const userService = require('../../services/userService');

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
  },

  deleteMilestone: fastify => async (request, reply) => {
    const { milestoneId } = request.params;
    fastify.log.info(
      `[Milestone Routes] Deleting milestone with id: ${milestoneId}`
    );
    try {
      const deleted = await milestoneService.deleteMilestone(milestoneId);
      reply.status(200).send(deleted);
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send('Error deleting milestone');
    }
  },

  updateMilestone: fastify => async (req, reply) => {
    fastify.log.info(
      `[Milestone Routes] :: PUT request at /milestones/${
        req.params.milestoneId
      }:`,
      req.body
    );

    const { milestone } = req.body;
    const { milestoneId } = req.params;

    try {
      const user = await userService.getUserById(req.user.id);
      const response = await milestoneService.updateMilestone(
        milestone,
        milestoneId,
        user
      );

      if (response.error) {
        fastify.log.error(
          '[Milestone Routes] :: Error updating milestone: ',
          response.error
        );
        reply.status(response.status).send(response);
      } else {
        reply.send({ success: 'Milestone updated successfully!' });
      }
    } catch (error) {
      fastify.log.error(
        '[Milestone Routes] :: Error updating milestone: ',
        error
      );
      reply.status(500).send({ error: 'Error updating milestone' });
    }
  }
};
