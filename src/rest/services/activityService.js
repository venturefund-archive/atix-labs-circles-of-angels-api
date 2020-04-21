/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const { coa } = require('@nomiclabs/buidler');
const { values, isEmpty } = require('lodash');
const fs = require('fs');
const { promisify } = require('util');
const files = require('../util/files');
const { forEachPromise } = require('../util/promises');
const { projectStatuses, userRoles } = require('../util/constants');
const { sha3 } = require('../util/hash');

const checkExistence = require('./helpers/checkExistence');
const validateRequiredParams = require('./helpers/validateRequiredParams');
const validateOwnership = require('./helpers/validateOwnership');
const validateMtype = require('./helpers/validateMtype');
const validatePhotoSize = require('./helpers/validatePhotoSize');
const {
  buildBlockURL,
  buildTxURL,
  buildAddressURL
} = require('./helpers/txExplorerHelper');
const COAError = require('../errors/COAError');
const errors = require('../errors/exporter/ErrorExporter');
const logger = require('../logger');

const claimType = 'claims';

module.exports = {
  readFile: promisify(fs.readFile),
  /**
   * Updates an existing task.
   * Returns an object with the id of the updated task
   *
   * @param {number} taskId task identifier
   * @param {number} userId user performing the operation. Must be the owner of the project
   * @param {object} taskParams task fields to update
   * @returns { {taskId: number} } id of updated task
   */
  async updateTask(taskId, { userId, taskParams }) {
    logger.info('[ActivityService] :: Entering updateTask method');
    validateRequiredParams({
      method: 'updateTask',
      params: { userId, taskId, taskParams }
    });

    const task = await checkExistence(this.activityDao, taskId, 'task');
    logger.info(
      `[ActivityService] :: Found task ${task.id} of milestone ${
        task.milestone
      }`
    );

    const project = await this.milestoneService.getProjectFromMilestone(
      task.milestone
    );

    // if the task exists this shouldn't happen
    if (!project) {
      logger.info(
        `[ActivityService] :: No project found for milestone ${task.milestone}`
      );
      throw new COAError(errors.task.ProjectNotFound(taskId));
    }

    validateOwnership(project.owner, userId);

    const allowEditStatuses = [
      projectStatuses.NEW,
      projectStatuses.REJECTED,
      projectStatuses.CONSENSUS
    ];

    if (!allowEditStatuses.includes(project.status)) {
      logger.error(
        `[ActivityService] :: It can't update an activity when the project is in ${
          project.status
        } status`
      );
      throw new COAError(
        errors.task.UpdateWithInvalidProjectStatus(project.status)
      );
    }

    // TODO: any other restriction for editing?

    logger.info(`[ActivityService] :: Updating task of id ${taskId}`);
    const updatedTask = await this.activityDao.updateActivity(
      taskParams,
      taskId
    );

    if (taskParams.budget) {
      const actualBudget = Number(task.budget);
      const newBudget = Number(taskParams.budget);
      const difference = newBudget - actualBudget;
      if (difference !== 0) {
        const newGoalAmount = Number(project.goalAmount) + difference;
        logger.info(
          `[ActivityService] :: Updating project ${
            project.id
          } goalAmount to ${newGoalAmount}`
        );
        await this.projectService.updateProject(project.id, {
          goalAmount: newGoalAmount
        });
      }
    }

    logger.info(`[ActivityService] :: Task of id ${updatedTask.id} updated`);
    return { taskId: updatedTask.id };
  },
  /**
   * Deletes an existing task.
   * Returns an object with the id of the deleted task
   *
   * @param {number} taskId task identifier
   * @param {number} userId user performing the operation. Must be the owner of the project
   * @returns { {taskId: number} } id of deleted task
   */
  async deleteTask(taskId, userId) {
    logger.info('[ActivityService] :: Entering deleteTask method');
    validateRequiredParams({
      method: 'deleteTask',
      params: { taskId, userId }
    });

    const task = await checkExistence(this.activityDao, taskId, 'task');
    logger.info(
      `[ActivityService] :: Found task ${task.id} of milestone ${
        task.milestone
      }`
    );

    const project = await this.milestoneService.getProjectFromMilestone(
      task.milestone
    );

    // if the task exists this shouldn't happen
    if (!project) {
      logger.info(
        `[ActivityService] :: No project found for milestone ${task.milestone}`
      );
      throw new COAError(errors.task.ProjectNotFound(taskId));
    }

    validateOwnership(project.owner, userId);

    const allowEditStatuses = [
      projectStatuses.NEW,
      projectStatuses.REJECTED,
      projectStatuses.CONSENSUS
    ];

    if (!allowEditStatuses.includes(project.status)) {
      logger.error(
        `[ActivityService] :: It can't delete a milestone when the project is in ${
          project.status
        } status`
      );
      throw new COAError(
        errors.task.DeleteWithInvalidProjectStatus(project.status)
      );
    }

    // TODO: any other restriction for deleting?

    logger.info(`[ActivityService] :: Deleting task of id ${taskId}`);
    const deletedTask = await this.activityDao.deleteActivity(taskId);
    logger.info(`[ActivityService] :: Task of id ${deletedTask.id} deleted`);

    const taskBudget = Number(task.budget);
    const newGoalAmount = Number(project.goalAmount) - taskBudget;
    logger.info(
      `[ActivityService] :: Updating project ${
        project.id
      } goalAmount to ${newGoalAmount}`
    );
    await this.projectService.updateProject(project.id, {
      goalAmount: newGoalAmount
    });
    // if all activities of a milestone are deleted,
    // should the milestone be deleted as well?
    return { taskId: deletedTask.id };
  },
  /**
   * Creates an task for an existing Milestone.
   * Returns an object with the id of the new task
   *
   * @param {number} milestoneId
   * @param {number} userId user performing the operation. Must be the owner of the project
   * @param {object} taskParams task data
   * @returns { {taskId: number} } id of updated task
   */
  async createTask(milestoneId, { userId, taskParams }) {
    logger.info('[ActivityService] :: Entering createTask method');
    validateRequiredParams({
      method: 'createTask',
      params: { milestoneId, userId, taskParams }
    });

    const {
      description,
      reviewCriteria,
      category,
      keyPersonnel,
      budget
    } = taskParams;
    validateRequiredParams({
      method: 'createTask',
      params: {
        description,
        reviewCriteria,
        category,
        keyPersonnel,
        budget
      }
    });

    logger.info(
      `[ActivityService] :: Getting project of milestone ${milestoneId}`
    );
    const project = await this.milestoneService.getProjectFromMilestone(
      milestoneId
    );

    // if the milestone exists this shouldn't happen
    if (!project) {
      logger.info(
        `[ActivityService] :: No project found for milestone ${milestoneId}`
      );
      throw new COAError(errors.milestone.ProjectNotFound(milestoneId));
    }
    validateOwnership(project.owner, userId);

    const allowedProjectStatus = [
      projectStatuses.NEW,
      projectStatuses.REJECTED,
      projectStatuses.CONSENSUS
    ];
    if (!allowedProjectStatus.includes(project.status)) {
      logger.error(
        `[ActivityService] :: Can't create activities in project ${
          project.id
        } with status ${project.status}`
      );
      throw new COAError(
        errors.task.CreateWithInvalidProjectStatus(project.status)
      );
    }

    // TODO: any other restriction for creating?
    logger.info(
      `[ActivityService] :: Creating new task in project ${
        project.id
      }, milestone ${milestoneId}`
    );
    const createdTask = await this.activityDao.saveActivity(
      {
        description,
        reviewCriteria,
        category,
        keyPersonnel,
        budget
      },
      milestoneId
    );
    logger.info(
      `[ActivityService] :: New task with id ${createdTask.id} created`
    );

    const taskBudget = Number(budget);
    const newGoalAmount = Number(project.goalAmount) + taskBudget;
    logger.info(
      `[ActivityService] :: Updating project ${
        project.id
      } goalAmount to ${newGoalAmount}`
    );
    await this.projectService.updateProject(project.id, {
      goalAmount: newGoalAmount
    });
    return { taskId: createdTask.id };
  },
  /**
   * Assigns an existing oracle candidate to a task.
   *
   * @param {number} taskId task id
   * @param {number} oracleId oracle id to assign
   * @param {number} userId user making the request
   */
  async assignOracle(taskId, oracleId, userId) {
    logger.info('[ActivityService] :: Entering assignOracle method');
    validateRequiredParams({
      method: 'assignOracle',
      params: { taskId, oracleId, userId }
    });
    const task = await checkExistence(this.activityDao, taskId, 'task');
    logger.info(
      `[ActivityService] :: Found task ${task.id} of milestone ${
        task.milestone
      }`
    );
    const project = await this.milestoneService.getProjectFromMilestone(
      task.milestone
    );
    validateOwnership(project.owner, userId);
    const oracle = await this.userService.getUserById(oracleId);

    if (oracle.role !== userRoles.PROJECT_SUPPORTER) {
      logger.error(
        `[ActivityService] :: User ${oracleId} is not a project supporter`
      );
      throw new COAError(errors.user.IsNotSupporter);
    }

    if (project.status !== projectStatuses.CONSENSUS) {
      logger.error(
        `[ActivityService] :: Status of project with id ${project.id} is not ${
          projectStatuses.CONSENSUS
        }`
      );
      throw new COAError(
        errors.task.AssignOracleWithInvalidProjectStatus(project.status)
      );
    }

    const isOracleCandidate = await this.projectService.isOracleCandidate({
      projectId: project.id,
      userId: oracleId
    });

    if (!isOracleCandidate) {
      logger.error(
        `[ActivityService] :: User of id ${oracleId} is not an oracle candidate for project ${
          project.id
        }`
      );
      throw new COAError(errors.task.NotOracleCandidate);
    }

    logger.info(
      `[ActivityService] :: Assigning oracle of id ${oracleId} to task ${taskId}`
    );
    const updatedTask = await this.activityDao.updateActivity(
      { oracle: oracleId },
      taskId
    );
    logger.info(`[ActivityService] :: Task of id ${updatedTask.id} updated`);
    return { taskId: updatedTask.id };
  },

  /**
   * Creates new Activities and associates them to the Milestone passed by parameter.
   *
   * Returns an array with all the Activities created.
   * @param {array} activities
   * @param {number} milestoneId
   */
  async createActivities(activities, milestoneId) {
    logger.info(
      '[Activity Service] :: Creating Activities for Milestone ID:',
      milestoneId
    );

    const savedActivities = [];

    // for each activity call this function
    const createActivity = (activity, context) =>
      new Promise(resolve => {
        process.nextTick(async () => {
          if (!values(activity).every(isEmpty)) {
            const savedActivity = await this.activityDao.saveActivity(
              activity,
              milestoneId
            );
            logger.info(
              '[Activity Service] :: Activity created:',
              savedActivity
            );
            context.push(savedActivity);
          }
          resolve();
        });
      });

    await forEachPromise(activities, createActivity, savedActivities);
    return savedActivities;
  },

  /**
   * Returns the milestone that the task belongs to or `undefined`
   *
   * Throws an error if the task does not exist
   *
   * @param {number} id
   * @returns milestone | `undefined`
   */
  async getMilestoneAndTaskFromId(id) {
    logger.info('[ActivityService] :: Entering getMilestoneFromTask method');
    const task = await checkExistence(this.activityDao, id, 'task');
    logger.info(
      `[ActivityService] :: Found task ${task.id} of milestone ${
        task.milestone
      }`
    );

    const { milestone } = await this.activityDao.getTaskByIdWithMilestone(id);
    if (!milestone) {
      logger.info(`[ActivityService] :: No milestone found for task ${id}`);
      throw new COAError(errors.task.MilestoneNotFound(id));
    }

    return { milestone, task };
  },

  /**
   * Sends the signed transaction to the blockchain
   * and saves the evidence in the database
   *
   * @param {Number} taskId
   * @param {Number} userId
   * @param {File} file
   * @param {String} description
   * @param {Boolean} approved
   * @param {Transaction} signedTransaction
   */
  async sendAddClaimTransaction({
    taskId,
    userId,
    file,
    description,
    approved,
    signedTransaction,
    userAddress
  }) {
    logger.info('[ActivityService] :: Entering sendAddClaimTransaction method');
    validateRequiredParams({
      method: 'sendAddClaimTransaction',
      params: {
        taskId,
        userId,
        file,
        description,
        approved,
        signedTransaction,
        userAddress
      }
    });

    const { milestone, task } = await this.getMilestoneAndTaskFromId(taskId);
    const { project: projectId } = milestone;
    const { oracle } = task;

    const projectFound = await this.projectService.getProjectById(projectId);
    const { status } = projectFound;

    if (status !== projectStatuses.EXECUTING) {
      logger.error(
        `[ActivityService] :: Can't upload evidence when project is in ${status} status`
      );
      throw new COAError(errors.project.InvalidStatusForEvidenceUpload(status));
    }

    if (oracle !== userId) {
      logger.error(
        `[ActivityService] :: User ${userId} is not the oracle assigned for task ${taskId}`
      );
      throw new COAError(errors.task.OracleNotAssigned({ userId, taskId }));
    }

    logger.info(
      '[ActivityService] :: Sending signed tx to the blockchain for task',
      taskId
    );
    const tx = await coa.sendAddClaimTransaction(signedTransaction);
    logger.info('[ActivityService] :: Add claim transaction sent');

    // TODO: we shouldn't save the file once we have the ipfs storage working
    logger.info(`[ActivityService] :: Saving file of type '${claimType}'`);
    const filePath = await files.validateAndSaveFile(claimType, file);
    logger.info(`[ActivityService] :: File saved to: ${filePath}`);
    const evidence = {
      description,
      proof: filePath,
      task: taskId,
      approved,
      txHash: tx.hash
    };
    logger.info('[ActivityService] :: Saving evidence in database', evidence);
    const taskEvidence = await this.taskEvidenceDao.addTaskEvidence(evidence);
    await this.transactionService.save({
      sender: userAddress,
      txHash: tx.hash,
      nonce: tx.nonce
    });
    return { claimId: taskEvidence.id };
  },

  /**
   * Receives a task evidence and sends the unsigned
   * transaction to the client with the user's encrypted json wallet
   *
   * @param {Number} taskId
   * @param {Number} userId
   * @param {File} file
   * @param {Boolean} approved
   * @param {JSON} userWallet
   */
  async getAddClaimTransaction({ taskId, file, approved, userWallet }) {
    logger.info('[ActivityService] :: Entering getAddClaimTransaction method');
    validateRequiredParams({
      method: 'getAddClaimTransaction',
      params: { taskId, file, approved, userWallet }
    });

    const { milestone, task } = await this.getMilestoneAndTaskFromId(taskId);
    const { id: milestoneId, project: projectId } = milestone;
    const { oracle } = task;
    const projectFound = await this.projectService.getProjectById(projectId);
    const { address } = projectFound;

    // TODO: we shouldn't save the file once we have the ipfs storage working
    validateMtype(claimType, file);
    validatePhotoSize(file);
    const filePath = await files.getSaveFilePath(claimType, file);
    logger.info(
      `[ActivityService] :: File to be saved in ${filePath} when tx is sent`
    );

    const claim = sha3(projectId, oracle, taskId);
    const proof = sha3(filePath); // TODO: this should be an ipfs hash

    logger.info('[ActivityService] :: Getting add claim transaction');
    const unsignedTx = await coa.getAddClaimTransaction(
      address,
      claim,
      proof,
      approved,
      milestoneId
    );
    const nonce = await this.transactionService.getNextNonce(
      userWallet.address
    );
    const txWithNonce = { ...unsignedTx, nonce };

    logger.info(
      '[ActivityService] :: Sending unsigned transaction to client',
      txWithNonce
    );
    return {
      tx: txWithNonce,
      encryptedWallet: userWallet.encryptedWallet
    };
  },

  /**
   * Get evidences by task
   *
   * @param {number} taskId
   * @returns transferId || error
   */
  async getTaskEvidences({ taskId }) {
    logger.info('[ActivityService] :: Entering getTaskEvidences method');
    validateRequiredParams({
      method: 'getTaskEvidences',
      params: { taskId }
    });

    await checkExistence(this.activityDao, taskId, 'task');
    logger.info('[ActivityService] :: Getting evidences for task', taskId);
    const evidences = await this.taskEvidenceDao.getEvidencesByTaskId(taskId);
    if (!evidences) {
      logger.info('[ActivityService] :: No evidences found for task', taskId);
      return [];
    }
    logger.info(
      `[ActivityService] :: Found ${
        evidences.length
      } evidences for task ${taskId}`
    );

    const evidencesWithLink = evidences.map(evidence => ({
      ...evidence,
      txLink: evidence.txHash ? buildTxURL(evidence.txHash) : undefined
    }));
    return evidencesWithLink;
  },

  /**
   * Returns true or false whether a task
   * has a verified evidence or not
   *
   * @param {number} taskId
   * @returns {Promise<boolean>}
   */
  async isTaskVerified(taskId) {
    try {
      // TODO: this should check the blockchain
      logger.info('[ActivityService] :: Entering isTaskVerified method');
      validateRequiredParams({
        method: 'isTaskVerified',
        params: { taskId }
      });
      const evidences = await this.getTaskEvidences({ taskId });
      if (!evidences || evidences.length === 0) return false;
      return evidences.some(evidence => !!evidence.approved);
    } catch (error) {
      logger.error(
        '[ActivityService] :: There was an error checking if task is verified',
        error
      );
      return false;
    }
  },

  /**
   * Returns the blockchain information for the specified evidence
   * @param {number} evidenceId
   */
  async getEvidenceBlockchainData(evidenceId) {
    logger.info(
      '[ActivityService] :: Entering getEvidenceBlockchainData method'
    );
    const evidence = await checkExistence(
      this.taskEvidenceDao,
      evidenceId,
      'task_evidence'
    );

    const { txHash, proof } = evidence;

    if (!txHash) {
      logger.info(
        `[ActivityService] :: Evidence ${evidenceId} does not have blockchain information`
      );
      throw new COAError(
        errors.task.EvidenceBlockchainInfoNotFound(evidenceId)
      );
    }

    logger.info(
      `[ActivityService] :: Getting transaction response for ${txHash}`
    );
    const txResponse = await coa.getTransactionResponse(txHash);
    // not sure if this is necessary
    if (!txResponse) {
      logger.info(
        `[ActivityService] :: Evidence ${evidenceId} does not have blockchain information`
      );
      throw new COAError(
        errors.task.EvidenceBlockchainInfoNotFound(evidenceId)
      );
    }
    const { blockNumber, timestamp, from } = txResponse;

    let oracleName;
    try {
      const oracle = await this.userService.getUserByAddress(from);
      oracleName = `${oracle.firstName} ${oracle.lastName}`;
    } catch (error) {
      logger.error('[ActivityService] :: Oracle not found');
    }

    return {
      oracle: {
        oracleName,
        oracleAddress: from,
        oracleAddressUrl: from ? buildAddressURL(from) : undefined
      },
      txHash,
      txHashUrl: txHash ? buildTxURL(txHash) : undefined,
      creationDate: timestamp ? new Date(timestamp) : undefined,
      blockNumber,
      blockNumberUrl: blockNumber ? buildBlockURL(blockNumber) : undefined,
      proof
    };
  }
};
