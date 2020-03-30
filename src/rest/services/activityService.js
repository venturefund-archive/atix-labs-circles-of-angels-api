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
const txExplorerHelper = require('./helpers/txExplorerHelper');
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
   * Add a claim for an existing project
   *
   * @param {number} taskId
   * @param {number} userId
   * @param {object} file
   * @param {boolean} approved
   * @returns taskId || error
   */
  async addClaim({ taskId, userId, file, description, approved, userWallet }) {
    logger.info('[ActivityService] :: Entering addClaim method');
    validateRequiredParams({
      method: 'addClaim',
      params: { userId, taskId, file, description, approved, userWallet }
    });

    const { milestone, task } = await this.getMilestoneAndTaskFromId(taskId);
    const { id: milestoneId, project: projectId } = milestone;
    const { oracle } = task;

    const projectFound = await this.projectService.getProjectById(projectId);
    const { status, address } = projectFound;

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

    // TODO: we shouldn't save the file once we have the ipfs storage working
    validateMtype(claimType, file);
    validatePhotoSize(file);
    logger.info(`[ActivityService] :: Saving file of type '${claimType}'`);
    const filePath = await files.saveFile(claimType, file);
    logger.info(`[ActivityService] :: File saved to: ${filePath}`);

    // TODO: is this correct?
    const claim = sha3(projectId, oracle, taskId);
    const proof = sha3(filePath); // TODO: this should be an ipfs hash

    const tx = await coa.addClaim(
      address,
      claim,
      proof,
      approved,
      milestoneId,
      userWallet
    );

    const evidence = {
      description,
      proof: filePath,
      task: taskId,
      approved,
      txHash: tx.hash
    };

    const evidenceCreated = await this.taskEvidenceDao.addTaskEvidence(
      evidence
    );

    logger.info('[ActivityService] :: Claim added succesfully');
    return { taskId: evidenceCreated.task };
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
      txLink: evidence.txHash
        ? txExplorerHelper.buildTxURL(evidence.txHash)
        : undefined
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
  }
};
