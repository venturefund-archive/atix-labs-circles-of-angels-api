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

  fastify.delete(
    `${basePath}/:id`,
    {
      schema: {
        params: {
          id: { type: 'number' }
        }
      },
      response: {
        200: {
          type: 'application/json',
          properties: {
            response: { type: 'application/json' }
          }
        }
      }
    },
    async (request, reply) => {
      const { id } = request.params;
      fastify.log.info(`[Project Routes] Deleting milestone with id: ${id}`);
      try {
        const deleted = await milestoneService.deleteMilestone(id);
        reply.status(200).send(deleted);
      } catch (error) {
        reply.status(500).send('Error deleting milestone');
      }
    }
  );
};

module.exports = routes;
