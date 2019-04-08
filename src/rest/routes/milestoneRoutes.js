const basePath = '/milestones';

const routes = async fastify => {
  const activityDao = require('../dao/activityDao')(fastify.models.activity);
  const activityService = require('../core/activityService')({
    fastify,
    activityDao
  });
  const milestoneDao = require('../dao/milestoneDao')(fastify.models.milestone);
  const milestoneService = require('../core/milestoneService')({
    fastify,
    milestoneDao,
    activityService
  });

  fastify.post(
    `${basePath}`,
    {
      schema: {
        type: 'application/json',
        body: {
          milestone: { type: 'object' },
          projectId: { type: 'number' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            response: { type: 'object' }
          }
        }
      }
    },
    async (req, reply) => {
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
    }
  );

  fastify.put(
    `${basePath}/:id`,
    {
      schema: {
        type: 'application/json',
        params: {
          id: { type: 'number' }
        },
        body: {
          milestone: { type: 'object' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            response: { type: 'object' }
          }
        }
      }
    },
    async (req, reply) => {
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
  );
};

module.exports = routes;
