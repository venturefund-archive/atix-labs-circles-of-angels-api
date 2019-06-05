const basePath = '/milestones';
const apiHelper = require('../../services/helper');

const getMilestones = fastify => async (request, reply) => {
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
};

const updateBudgetStatus = fastify => async (req, reply) => {
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
    const user = await userService.getUserById(req.user.id);
    const response = await milestoneService.updateBudgetStatus(
      id,
      budgetStatusId,
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
};

const getBudgetStatus = fastify => async (req, reply) => {
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
};

const deleteMilestone = fastify => async (request, reply) => {
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
};

const createMilestone = fastify => async (req, reply) => {
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
};

const updateMilestone = fastify => async (req, reply) => {
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
};

module.exports = fastify => ({
  getMilestones: getMilestones(fastify),
  updateBudgetStatus: updateBudgetStatus(fastify),
  getBudgetStatus: getBudgetStatus(fastify),
  deleteMilestone: deleteMilestone(fastify),
  createMilestone: createMilestone(fastify),
  updateMilestone: updateMilestone(fastify)
});
