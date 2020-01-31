/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const activityService = require('../../services/activityService');
const milestoneService = require('../../services/milestoneService'); // this wont work until milestoneService MR is merged

module.exports = {
  createTask: () => async (request, reply) => {
    const { milestoneId } = request.params;
    const taskParams = request.body;
    const userId = request.user.id;
    const response = await activityService.createTask(milestoneId, {
      userId,
      taskParams
    });
    reply.status(200).send(response);
  },

  updateTask: () => async (request, reply) => {
    const { taskId } = request.params;
    const taskParams = request.body;
    const userId = request.user.id;
    const response = await activityService.updateTask(taskId, {
      userId,
      taskParams
    });
    reply.status(200).send(response);
  },

  deleteTask: () => async (request, reply) => {
    const { taskId } = request.params;
    const userId = request.user.id;
    const response = await activityService.deleteTask(taskId, userId);
    reply.status(200).send(response);
  },

  assignOracle: () => async (request, reply) => {
    const { taskId } = request.params;
    const userId = request.user.id;
    const { oracleId } = request.body || {};
    const response = await activityService.assignOracle(taskId, oracleId, userId);
    reply.status(200).send(response);
  },

  updateStatus: fastify => async (req, reply) => {
    fastify.log.info(
      `[Activity Routes] :: PUT request at /activities/${
        req.params.activityId
      }/status:`,
      req.body
    );

    const { status } = req.body;
    const { activityId } = req.params;

    try {
      const response = await activityService.updateStatus(status, activityId);

      if (response.error) {
        fastify.log.error(
          '[Activity Routes] :: Error updating activity: ',
          response.error
        );
        reply.status(response.status).send(response);
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
  },

  uploadEvidence: fastify => async (req, reply) => {
    const { activityId } = req.params;
    fastify.log.info(
      `[Activity Routes] :: POST request at /activities/${activityId}/evidence:`,
      req
    );
    const { evidenceFiles } = req.raw.files;

    try {
      const response = await activityService.addEvidenceFiles(
        activityId,
        evidenceFiles,
        req.user
      );

      if (response.error) {
        fastify.log.error(
          '[Activity Routes] :: Error uploading evidences:',
          response.error
        );
        reply.status(response.status).send(response);
      } else {
        reply.status(200).send(response);
      }
    } catch (error) {
      fastify.log.error(
        '[Activity Routes] :: Error uploading evidences:',
        error
      );
      reply.status(500).send({ error: 'Error uploading evidences' });
    }
  },

  deleteEvidence: fastify => async (request, reply) => {
    const { activityId, evidenceId, fileType } = request.params;
    fastify.log.info(
      `[Activity Routes] :: DELETE request activities/${activityId}/evidence/${evidenceId}/${fileType}`
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
      fastify.log.error('[Activity Routes] :: Error deleting evidence:', error);
      reply.status(500).send({ error: 'Error deleting evidence' });
    }
  },

  getActivity: fastify => async (request, reply) => {
    const { activityId } = request.params;

    fastify.log.info(
      `[Activity Routes] :: GET request at /activities/${activityId}`
    );

    try {
      const activity = await activityService.getActivityDetails(activityId);

      if (activity.error) {
        reply.status(activity.status).send(activity);
      } else {
        fastify.log.info('[Activity Routes] :: Activity found:', activity);
        reply.status(200).send(activity);
      }
    } catch (error) {
      fastify.log.error('[Activity Routes] :: Error getting activity:', error);
      reply.status(500).send({ error: 'Error getting activity' });
    }
  },

  unassignOracle: fastify => async (request, reply) => {
    const { activityId } = request.params;
    fastify.log.info(
      `[Activity Routes] :: DELETE request at /activities/${activityId}/oracle`
    );
    try {
      const assign = await activityService.unassignOracleToActivity(activityId);
      if (assign.error) {
        reply.status(assign.status).send(assign);
      } else {
        reply.status(200).send({ success: 'Oracles successfully unassigned!' });
      }
    } catch (error) {
      fastify.log.error(
        '[Activity Routes] :: Error unassigning oracles from activity:',
        error
      );
      reply.status(500).send('Error unassigning oracles from activity');
    }
  },

  downloadEvidence: fastify => async (request, reply) => {
    const { activityId, evidenceId, fileType } = request.params;
    fastify.log.info(
      `[Activity Routes] :: GET request at /activities/${activityId}/evidence/${evidenceId}/${fileType}`
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
        reply.status(res.status).send(res);
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
      fastify.log.error('[Activity Routes] :: Error getting evidence:', error);
      reply.status(500).send({ error: 'Error getting evidence' });
    }
  },

  completeActivity: fastify => async (request, reply) => {
    const { activityId } = request.params;
    fastify.log.info(`[Activity Routes] Completing activity ${activityId}`);
    try {
      const activity = await activityService.completeActivity(
        activityId,
        milestoneService.getMilestoneById
      );
      if (!activity)
        if (activity.error) {
          reply.status(activity.status).send(activity);
        } else {
          reply.status(200).send({ response: Boolean(activity) });
        }
      return activity;
    } catch (error) {
      fastify.log.error(
        '[Activity Routes] :: Error completing activity:',
        error
      );
      reply.status(500).send({ error: 'Error completing activity' });
    }
  },

  addApprovedClaim: () => async (request, reply) => {
    const { taskId } = request.params;
    const userId = request.user.id;
    const { file } = request.raw.files || {};

    const response = await activityService.addClaim({
      taskId,
      userId,
      file,
      approved: true
    });

    reply.status(200).send(response);
  },

  addDisapprovedClaim: () => async (request, reply) => {
    const { taskId } = request.params;
    const userId = request.user.id;
    const { file } = request.raw.files || {};

    const response = await activityService.addClaim({
      taskId,
      userId,
      file,
      approved: false
    });

    reply.status(200).send(response);
  }
};
