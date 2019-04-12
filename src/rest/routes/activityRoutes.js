const fileUpload = require('fastify-file-upload');
const fileDaoBuilder = require('../dao/fileDao');
const fileServiceBuilder = require('../core/fileService');
const photoDaoBuilder = require('../dao/photoDao');
const photoServiceBuilder = require('../core/photoService');
const activityFileDaoBuilder = require('../dao/activityFileDao');
const activityPhotoDaoBuilder = require('../dao/activityPhotoDao');
const activityDaoBuilder = require('../dao/activityDao');
const oracleActivityDaoBuilder = require('../dao/oracleActivityDao');
const activityServiceBuilder = require('../core/activityService');

const basePath = '/activities';
const routes = async fastify => {
  fastify.register(fileUpload);
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
    `${basePath}/:id/evidences`,
    {
      schema: {
        type: 'multipart/form-data',
        params: {
          id: { type: 'number' }
        },
        raw: {
          files: { type: 'object' }
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
      const { id } = req.params;
      const { evidenceFiles } = req.raw.files;

      fastify.log.info(
        `[Activity Routes] :: POST request at /activities/${id}/upload:`,
        evidenceFiles
      );

      try {
        const response = await activityService.addEvidenceFiles(
          id,
          evidenceFiles
        );

        reply.status(200).send(response);
      } catch (error) {
        fastify.log.error(
          '[Activity Routes] :: Error uploading evidences:',
          error
        );
        reply.status(500).send({ error: 'Error uploading evidences' });
      }
    }
  );

  fastify.delete(
    `${basePath}/:activityId/evidences/:evidenceId`,
    {
      schema: {
        params: {
          activityId: { type: 'number' },
          evidenceId: { type: 'number' }
        },
        body: {
          fileType: { type: 'string' }
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
    async (request, reply) => {
      const { activityId, evidenceId } = request.params;
      const { fileType } = request.body;
      fastify.log.info(
        `[Activity Routes] :: DELETE request at /activities/${activityId}/evidence/${evidenceId}`
      );

      try {
        const deletedEvidence = activityService.deleteEvidence(
          activityId,
          evidenceId,
          fileType
        );

        if (deletedEvidence.error) {
          reply.status(deletedEvidence.status).send(deletedEvidence);
        } else {
          reply.status(200).send(deletedEvidence);
        }
      } catch (error) {
        fastify.log.error(
          '[Activity Routes] :: Error deleting evidence:',
          error
        );
        reply.status(500).send({ error: 'Error deleting evidence' });
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
