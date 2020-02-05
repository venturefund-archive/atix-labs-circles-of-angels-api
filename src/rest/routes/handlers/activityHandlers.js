/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const activityService = require('../../services/activityService');

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
    const response = await activityService.assignOracle(
      taskId,
      oracleId,
      userId
    );
    reply.status(200).send(response);
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
