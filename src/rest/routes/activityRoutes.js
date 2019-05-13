const fileUpload = require('fastify-file-upload');

const basePath = '/activities';
const restBasePath = '/activity';

const apiHelper = require('../services/helper');

const routes = async fastify => {
  fastify.register(fileUpload);

  fastify.post(
    `${basePath}`,
    {
      beforeHandler: [fastify.generalAuth],
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
      const { activityService } = apiHelper.helper.services;
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
      beforeHandler: [fastify.generalAuth],
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
      const { activityService } = apiHelper.helper.services;
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
    `${restBasePath}/:id`,
    {
      beforeHandler: [fastify.generalAuth],
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
      const { activityService, milestoneService } = apiHelper.helper.services;
      const { id } = request.params;
      fastify.log.info(`[Activity Routes] Deleting activity with id: ${id}`);
      try {
        const deleted = await activityService.deleteActivity(
          id,
          milestoneService
        );
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
      beforeHandler: [fastify.generalAuth],
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
      const { activityService } = apiHelper.helper.services;
      const { id } = req.params;
      fastify.log.info(
        `[Activity Routes] :: POST request at /activities/${id}/evidences:`,
        req
      );
      const { evidenceFiles } = req.raw.files;

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
    `${basePath}/:activityId/evidences/:evidenceId/:fileType`,
    {
      beforeHandler: [fastify.generalAuth],
      schema: {
        params: {
          activityId: { type: 'number' },
          evidenceId: { type: 'number' },
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
      const { activityService } = apiHelper.helper.services;
      const { activityId, evidenceId, fileType } = request.params;
      fastify.log.info(
        `[Activity Routes] :: DELETE request atctivities/${activityId}/evidences/${evidenceId}/${fileType}`
      );

      try {
        const deletedEvidence = await activityService.deleteEvidence(
          activityId,
          evidenceId,
          fileType
        );

        if (deletedEvidence.error) {
          reply.status(deletedEvidence.status).send(deletedEvidence);
        } else {
          reply.status(200).send({ success: 'Evidence deleted successfully!' });
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

  fastify.get(
    `${basePath}/:id`,
    {
      beforeHandler: [fastify.generalAuth],
      schema: {
        params: {
          id: { type: 'number' }
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
      const { activityService } = apiHelper.helper.services;
      const { id } = request.params;

      fastify.log.info(`[Activity Routes] :: GET request at /activities/${id}`);

      try {
        const activity = await activityService.getActivityDetails(id);

        if (activity.error) {
          reply.status(activity.status).send(activity);
        } else {
          fastify.log.info('[Activity Routes] :: Activity found:', activity);
          reply.status(200).send(activity);
        }
      } catch (error) {
        fastify.log.error(
          '[Activity Routes] :: Error getting activity:',
          error
        );
        reply.status(500).send({ error: 'Error getting activity' });
      }
    }
  );

  fastify.put(
    `${basePath}/:id/assignOracle/:userId`,
    {
      beforeHandler: [fastify.generalAuth],
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
      const { activityService } = apiHelper.helper.services;
      const { id, userId } = request.params;
      fastify.log.info(
        `[Activity Routes] :: PUT request at /activities/${id}/assignOracle/${userId}`
      );

      try {
        const assign = await activityService.assignOracleToActivity(userId, id);

        if (assign.error) {
          reply.status(assign.status).send(assign);
        } else {
          reply.status(200).send({ success: 'Oracle assigned successfully!' });
        }
      } catch (error) {
        fastify.log.error(
          '[Activity Routes] :: Error assigning user to activity:',
          error
        );
        reply.status(500).send({ error: 'Error assigning user to activity' });
      }
    }
  );

  fastify.delete(
    `${basePath}/:id/unassignOracle`,
    {
      beforeHandler: [fastify.generalAuth],
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
      const { activityService } = apiHelper.helper.services;
      const { id } = request.params;
      fastify.log.info(
        `[Activity Routes] :: DELETE request at /activities/${id}/unassignOracle`
      );
      try {
        const assign = await activityService.unassignOracleToActivity(id);
        if (assign.error) {
          reply.status(assign.status).send(assign);
        } else {
          reply
            .status(200)
            .send({ success: 'Oracles successfully unassigned!' });
        }
      } catch (error) {
        fastify.log.error(
          '[Activity Routes] :: Error unassigning oracles from activity:',
          error
        );
        reply.status(500).send('Error unassigning oracles from activity');
      }
    }
  );

  fastify.get(
    `${basePath}/:activityId/evidences/:evidenceId/download/:fileType`,
    {
      beforeHandler: [fastify.generalAuth],
      schema: {
        params: {
          activityId: { type: 'number' },
          evidenceId: { type: 'number' },
          fileType: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'application/octet-stream',
          properties: {
            response: { type: 'application/octet-stream' }
          }
        }
      }
    },
    async (request, reply) => {
      const { activityService } = apiHelper.helper.services;
      const { activityId, evidenceId, fileType } = request.params;
      fastify.log.info(
        `[Activity Routes] :: GET request at /activities/${activityId}/evidence/${evidenceId}/download/${fileType}`
      );
      try {
        const res = await activityService.downloadEvidence(
          activityId,
          evidenceId,
          fileType
        );

        if (res && res.error) {
          fastify.log.error(
            '[Activity Routes] :: Error getting evidence:',
            res.error
          );
          reply.status(res.status).send(res.error);
        } else {
          fastify.log.info(
            '[Activity Routes] :: Activity evidence downloaded:',
            res
          );
          reply.header('file', res.filename);
          reply.header('Access-Control-Expose-Headers', 'file');
          reply.send(res.filestream);
        }
      } catch (error) {
        fastify.log.error(
          '[Activity Routes] :: Error getting evidence:',
          error
        );
        reply.status(500).send({ error: 'Error getting evidence' });
      }
    }
  );

  fastify.post(
    `${basePath}/:activityId/complete`,
    {
      beforeHandler: [fastify.generalAuth],
      schema: {
        params: {
          activityId: { type: 'number' }
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
      const { activityService, milestoneService } = apiHelper.helper.services;
      const { activityId } = request.params;
      fastify.log.info(`[Activity Routes] Completing activity ${activityId}`);
      try {
        const activity = (await activityService.completeActivity(
          activityId,
          milestoneService.getMilestoneById
        ))[0];
        await milestoneService.tryCompleteMilestone(activity.milestone);
        reply.status(200).send(Boolean(activity));
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send('Error assigning user on activity');
      }
    }
  );
};

module.exports = routes;
