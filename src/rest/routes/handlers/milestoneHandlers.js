const basePath = '/milestones';
const apiHelper = require('../../services/helper');

module.exports = {
  getMilestones: fastify => async (request, reply) => {
    const { milestoneService } = apiHelper.helper.services;
    fastify.log.info('[Milestone Routes] :: GET request at /milestones');
    try {
      const milestones = await milestoneService.getAllMilestones();
      reply.status(200).send({ milestones });
    } catch (error) {
      fastify.log.error(
        '[Milestone Routes] :: Error getting all milestones: ',
        error
      );
      reply.status(500).send({ error: 'Error getting all milestones' });
    }
  },

  updateBudgetStatus: fastify => async (req, reply) => {
    const { milestoneService, userService } = apiHelper.helper.services;
    fastify.log.info(
      `[Milestone Routes] :: PUT request at /${basePath}/${
        req.params.id
      }/budgetStatus:`,
      req.body
    );

    const { budgetStatusId } = req.body;
    const { id } = req.params;

    try {
      const response = await milestoneService.updateBudgetStatus(
        id,
        budgetStatusId
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
  },

  getBudgetStatus: fastify => async (req, reply) => {
    const { milestoneService } = apiHelper.helper.services;
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
    const { milestoneService } = apiHelper.helper.services;
    const { id } = request.params;
    fastify.log.info(`[Milestone Routes] Deleting milestone with id: ${id}`);
    try {
      const deleted = await milestoneService.deleteMilestone(id);
      reply.status(200).send(deleted);
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send('Error deleting milestone');
    }
  },

  createMilestone: fastify => async (req, reply) => {
    const { milestoneService } = apiHelper.helper.services;
    fastify.log.info(
      '[Milestone Routes] :: POST request at /milestones:',
      req.body
    );

    const { milestone, projectId } = req.body;

    try {
      const response = await milestoneService.createMilestone(
        milestone,
        projectId
      );

      if (response.error) {
        fastify.log.error(
          '[Milestone Routes] :: Error creating milestone: ',
          response.error
        );
        reply.status(response.status).send(response.error);
      } else {
        reply.send({ success: 'Milestone created successfully!' });
      }
    } catch (error) {
      fastify.log.error(
        '[Milestone Routes] :: Error creating milestone: ',
        error
      );
      reply.status(500).send({ error: 'Error creating milestone' });
    }
  },

  updateMilestone: fastify => async (req, reply) => {
    const { milestoneService } = apiHelper.helper.services;
    fastify.log.info(
      `[Milestone Routes] :: PUT request at /milestones/${req.params.id}:`,
      req.body
    );

    const { milestone } = req.body;
    const { id } = req.params;

    try {
      const response = await milestoneService.updateMilestone(milestone, id);

      if (response.error) {
        fastify.log.error(
          '[Milestone Routes] :: Error updating milestone: ',
          response.error
        );
        reply.status(response.status).send(response.error);
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
