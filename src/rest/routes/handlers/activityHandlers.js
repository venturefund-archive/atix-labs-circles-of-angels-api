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

  getApprovedClaimTransaction: () => async (request, reply) => {
    const { taskId } = request.params;
    const { proofFileHash } = request.body;
    const { id: userId, wallet: userWallet } = request.user;
    const { description } = request.raw.body || {};

    const response = await activityService.getAddClaimTransaction({
      taskId,
      userId,
      proofFileHash,
      description,
      approved: true,
      userWallet
    });

    reply.status(200).send(response);
  },

  getDisapprovedClaimTransaction: () => async (request, reply) => {
    const { taskId } = request.params;
    const { proofFileHash } = request.body;
    const { wallet: userWallet } = request.user;

    const response = await activityService.getAddClaimTransaction({
      taskId,
      proofFileHash,
      approved: false,
      userWallet
    });

    reply.status(200).send(response);
  },

  sendClaimTransaction: approved => async (request, reply) => {
    const { taskId } = request.params;
    const { proofFileHash } = request.body;
    const { id: userId, wallet } = request.user;
    const { description, signedTransaction } = request.raw.body || {};

    const response = await activityService.sendAddClaimTransaction({
      taskId,
      userId,
      proofFileHash,
      description,
      approved,
      signedTransaction,
      userAddress: wallet.address
    });
    reply.status(200).send(response);
  },

  getTasksEvidences: () => async (request, reply) => {
    const { taskId } = request.params;
    const response = await activityService.getTaskEvidences({
      taskId
    });
    reply.status(200).send(response);
  },

  getEvidenceBlockchainData: () => async (request, reply) => {
    const { evidenceId } = request.params;
    const response = await activityService.getEvidenceBlockchainData(
      evidenceId
    );
    reply.status(200).send(response);
  }
};
