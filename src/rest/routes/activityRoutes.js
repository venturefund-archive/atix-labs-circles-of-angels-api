const basePath = '/activities';

const routes = async fastify => {
  const activityDao = require('../dao/activityDao')(fastify.models.activity);
  const oracleActivityDao = require('../dao/oracleActivityDao')(
    fastify.models.oracle_activity
  );
  const activityService = require('../core/activityService')({
    fastify,
    activityDao,
    oracleActivityDao
  });

  fastify.post(
    `${basePath}`,
    {
      schema: {
        type: 'application/json',
        body: {
          activity: { type: 'object' },
          milestoneId: { type: 'number' }
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
        '[Activity Routes] :: POST request at /activities:',
        req.body
      );

      const { activity, milestoneId } = req.body;

      try {
        const response = await activityService.createActivity(
          activity,
          milestoneId
        );

        if (response.error) {
          fastify.log.error(
            '[Activity Routes] :: Error creating activity: ',
            response.error
          );
          reply.status(response.status).send(response.error);
        } else {
          reply.send({ success: 'Activity created successfully!' });
        }
      } catch (error) {
        fastify.log.error(
          '[Activity Routes] :: Error creating activity: ',
          error
        );
        reply.status(500).send({ error: 'Error creating activity' });
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
          activity: { type: 'object' }
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
        `[Activity Routes] :: PUT request at /activities/${req.params.id}:`,
        req.body
      );

      const { activity } = req.body;
      const { id } = req.params;

      try {
        const response = await activityService.updateActivity(activity, id);

        if (response.error) {
          fastify.log.error(
            '[Activity Routes] :: Error updating activity: ',
            response.error
          );
          reply.status(response.status).send(response.error);
        } else {
          reply.send({ success: 'Activity updated successfully!' });
        }
      } catch (error) {
        fastify.log.error(
          '[Activity Routes] :: Error updating activity: ',
          error
        );
        reply.status(500).send({ error: 'Error updating activity' });
      }
    }
  );

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
      fastify.log.info(`[Activity Routes] Deleting activity with id: ${id}`);
      try {
        const deleted = await activityService.deleteActivity(id);
        reply.status(200).send(deleted);
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send('Error deleting activity');
      }
    }
  );

  fastify.post(
    `${basePath}/:id/assignOracle/:userId`,
    {
      schema: {
        params: {
          id: { type: 'number' },
          userId: { type: 'number' }
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
      const { id, userId } = request.params;
      fastify.log.info(
        `[Activity Routes] Assign user ${userId} to activity ${id} as Oracle`
      );
      try {
        const assign = await activityService.assignOracleToActivity(userId, id);
        reply.status(200).send(Boolean(assign));
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send('Error assigning user on activity');
      }
    }
  );

  fastify.post(
    `${basePath}/:id/unassignOracle`,
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
      fastify.log.info(`[Activity Routes] Unassign oracle to activity ${id}`);
      try {
        const assign = await activityService.unassignOracleToActivity(id);
        reply.status(200).send(Boolean(assign));
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send('Error assigning user on activity');
      }
    }
  );
};

module.exports = routes;
