const fileDaoBuilder = require('../dao/fileDao');
const fileServiceBuilder = require('../core/fileService');
const photoDaoBuilder = require('../dao/photoDao');
const photoServiceBuilder = require('../core/photoService');
const activityFileDaoBuilder = require('../dao/activityFileDao');
const activityPhotoDaoBuilder = require('../dao/activityPhotoDao');
const activityDaoBuilder = require('../dao/activityDao');
const oracleActivityDaoBuilder = require('../dao/oracleActivityDao');
const activityServiceBuilder = require('../core/activityService');
const milestoneDaoBuilder = require('../dao/milestoneDao');
const milestoneServiceBuilder = require('../core/milestoneService');
const milestoneBudgetStatusDaoBuilder = require('../dao/milestoneBudgetStatusDao');

const basePath = '/milestones';
const routes = async fastify => {
  const fileService = fileServiceBuilder({
    fastify,
    fileDao: fileDaoBuilder(fastify.models.file)
  });
  const photoService = photoServiceBuilder({
    fastify,
    photoDao: photoDaoBuilder(fastify.models.photo)
  });
  const activityService = activityServiceBuilder({
    fastify,
    activityDao: activityDaoBuilder(fastify.models.activity),
    fileService,
    photoService,
    activityFileDao: activityFileDaoBuilder(fastify.models.activity_file),
    activityPhotoDao: activityPhotoDaoBuilder(fastify.models.activity_photo),
    oracleActivityDao: oracleActivityDaoBuilder(fastify.models.oracle_activity)
  });
  const milestoneService = milestoneServiceBuilder({
    fastify,
    milestoneDao: milestoneDaoBuilder(fastify.models.milestone),
    milestoneBudgetStatusDao: milestoneBudgetStatusDaoBuilder(
      fastify.models.milestone_budget_status
    ),
    activityService
  });

  fastify.get(
    `${basePath}`,
    {
      response: {
        200: {
          type: 'object',
          properties: {
            milestones: { type: 'array', items: { type: 'object' } }
          }
        }
      }
    },
    async (request, reply) => {
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
    }
  );

  fastify.put(
    `${basePath}/:id/budgetStatus`,
    {
      schema: {
        params: {
          id: { type: 'number' }
        },
        body: {
          budgetStatusId: { type: 'number' }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'string' }
            }
          }
        }
      }
    },
    async (req, reply) => {
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
    }
  );

  fastify.get(
    `${basePath}/budgetStatus`,
    {
      schema: {
        response: {
          200: {
            type: 'object',
            properties: {
              budgetStatus: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    name: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    },
    async (req, reply) => {
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
      fastify.log.info(`[Milestone Routes] Deleting milestone with id: ${id}`);
      try {
        const deleted = await milestoneService.deleteMilestone(id);
        reply.status(200).send(deleted);
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send('Error deleting milestone');
      }
    }
  );

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
