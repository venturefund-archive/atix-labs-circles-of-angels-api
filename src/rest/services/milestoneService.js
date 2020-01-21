/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const { coa } = require('@nomiclabs/buidler');
const { utils } = require('ethers');
const { isEmpty, remove } = require('lodash');
const { saveFile } = require('../util/files');
const {
  activityStatus,
  milestoneBudgetStatus,
  blockchainStatus,
  xlsxConfigs,
  projectStatuses
} = require('../util/constants');
const checkExistence = require('./helpers/checkExistence');
const validateRequiredParams = require('./helpers/validateRequiredParams');
const validateOwnership = require('./helpers/validateOwnership');
const validateMtype = require('./helpers/validateMtype');
const validatePhotoSize = require('./helpers/validatePhotoSize');
const COAError = require('../errors/COAError');
const errors = require('../errors/exporter/ErrorExporter');
const { readExcelData } = require('../util/excelParser');

const logger = require('../logger');

// TODO: replace with actual function
const sha3 = (a, b, c) => utils.id(`${a}-${b}-${c}`);

const evidenceType = 'evidencePhoto';

module.exports = {
  /**
   * Returns the project that the milestone belongs to
   * or `undefined` if the milestone doesn't have a project.
   *
   * Throws an error if the milestone does not exist
   *
   * @param {number} id
   * @returns project | `undefined`
   */
  async getProjectFromMilestone(id) {
    logger.info(
      '[MilestoneService] :: Entering getProjectFromMilestone method'
    );
    const milestone = await checkExistence(this.milestoneDao, id, 'milestone');
    logger.info(
      `[MilestoneService] :: Found milestone ${milestone.id} of project ${
        milestone.project
      }`
    );
    const { project } = await this.milestoneDao.getMilestoneByIdWithProject(id);
    return project;
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
    logger.info('[MilestoneService] :: Entering getMilestoneFromTask method');
    const task = await checkExistence(this.taskDao, 'task');
    logger.info(
      `[MilestoneService] :: Found task ${task.id} of milestone ${
        task.milestone
      }`
    );

    const { milestone } = await this.taskDao.getMilestoneFromTask(id);
    if (!milestone) {
      logger.info(`[MilestoneService] :: No milestone found for task ${id}`);
      throw new COAError(errors.task.MilestoneNotFound(id));
    }

    return { milestone, task };
  },

  /**
   * Creates a Milestone for an existing Project.
   * Returns an object with the id of the new milestone
   *
   * @param {number} projectId
   * @param {number} userId user performing the operation. Must be the owner of the project
   * @param {object} milestoneParams milestone data
   * @returns { {milestoneId: number} } id of updated milestone
   */
  async createMilestone(projectId, { userId, milestoneParams }) {
    logger.info('[MilestoneService] :: Entering createMilestone method');
    validateRequiredParams({
      method: 'createMilestone',
      params: { projectId, userId, milestoneParams }
    });

    const { description, category } = milestoneParams;
    validateRequiredParams({
      method: 'createMilestone',
      params: {
        description,
        category
      }
    });
    logger.info(`[MilestoneService] :: Getting project ${projectId}`);
    const project = await this.projectService.getProject(projectId);
    if (!project) {
      logger.info(`[MilestoneService] :: Project ${projectId} not found`);
      throw new COAError(
        errors.common.CantFindModelWithId('project', projectId)
      );
    }
    validateOwnership(project.owner, userId);

    // TODO: define in which statuses is ok to create a milestone
    if (project.status !== projectStatuses.NEW) {
      logger.error(
        `[MilestoneService] :: Status of project with id ${projectId} is not ${
          projectStatuses.NEW
        }`
      );
      throw new COAError(
        errors.milestone.CreateWithInvalidProjectStatus(project.status)
      );
    }

    // TODO: any other restriction for creating?
    logger.info(
      `[MilestoneService] :: Creating new milestone in project ${projectId}`
    );
    const createdMilestone = await this.milestoneDao.saveMilestone({
      milestone: { description, category },
      projectId
    });
    logger.info(
      `[MilestoneService] :: New milestone with id ${
        createdMilestone.id
      } created`
    );

    // TODO: should it be able to create tasks if provided?

    return { milestoneId: createdMilestone.id };
  },

  /**
   * Updates an existing milestone.
   * Returns an object with the id of the updated milestone
   *
   * @param {number} milestoneId milestone identifier
   * @param {number} userId user performing the operation. Must be the owner of the project
   * @param {object} milestoneParams milestoneId fields to update
   * @returns { {milestoneId: number} } id of updated milestone
   */
  async updateMilestone(milestoneId, { userId, milestoneParams }) {
    // TODO: should replace updateMilestone
    logger.info('[MilestoneService] :: Entering updateMilestone method');
    validateRequiredParams({
      method: 'updateMilestone',
      params: { userId, milestoneId, milestoneParams }
    });

    const project = await this.getProjectFromMilestone(milestoneId);

    // if the milestone exists this shouldn't happen
    if (!project) {
      logger.info(
        `[MilestoneService] :: No project found for milestone ${milestoneId}`
      );
      throw new COAError(errors.milestone.ProjectNotFound(milestoneId));
    }

    validateOwnership(project.owner, userId);

    // TODO: define in which statuses is ok to edit a milestone
    if (project.status !== projectStatuses.NEW) {
      logger.error(
        `[MilestoneService] :: Status of project with id ${project.id} is not ${
          projectStatuses.NEW
        }`
      );
      throw new COAError(
        errors.milestone.UpdateWithInvalidProjectStatus(project.status)
      );
    }

    // TODO: any other restriction for editing?

    logger.info(
      `[MilestoneService] :: Updating milestone of id ${milestoneId}`
    );
    const updatedMilestone = await this.milestoneDao.updateMilestone(
      milestoneParams,
      milestoneId
    );
    logger.info(
      `[MilestoneService] :: Milestone of id ${updatedMilestone.id} updated`
    );
    return { milestoneId: updatedMilestone.id };
  },

  /**
   * Permanently remove an existing milestone and all its tasks
   * Returns an object with the id of the deleted milestone
   *
   * @param milestoneId
   * @param userId user performing the operation. Must be the owner of the project
   * @returns { {milestoneId: number} } id of deleted milestone
   */
  async deleteMilestone(milestoneId, userId) {
    logger.info('[MilestoneService] :: Entering deleteMilestone method');
    validateRequiredParams({
      method: 'deleteMilestone',
      params: { milestoneId, userId }
    });

    const project = await this.getProjectFromMilestone(milestoneId);
    // if the milestone exists this shouldn't happen
    if (!project) {
      logger.info(
        `[MilestoneService] :: No project found for milestone ${milestoneId}`
      );
      throw new COAError(errors.milestone.ProjectNotFound(milestoneId));
    }
    validateOwnership(project.owner, userId);

    // TODO: define in which statuses is ok to delete a milestone
    if (project.status !== projectStatuses.NEW) {
      logger.error(
        `[MilestoneService] :: Status of project with id ${project.id} is not ${
          projectStatuses.NEW
        }`
      );
      throw new COAError(
        errors.milestone.DeleteWithInvalidProjectStatus(project.status)
      );
    }

    // TODO: any other restriction for deleting?

    logger.info(
      `[MilestoneService] :: Deleting milestone of id ${milestoneId}`
    );
    const deletedMilestone = await this.milestoneDao.deleteMilestone(
      milestoneId
    );
    logger.info(
      `[MilestoneService] :: Milestone of id ${deletedMilestone.id} deleted`
    );
    return { milestoneId: deletedMilestone.id };
  },

  deleteFieldsFromMilestone(milestone) {
    const newMilestone = milestone;
    delete newMilestone.impact;
    delete newMilestone.impactCriterion;
    delete newMilestone.signsOfSuccess;
    delete newMilestone.signsOfSuccessCriterion;
    delete newMilestone.keyPersonnel;
    delete newMilestone.budget;
    newMilestone.description = milestone.tasks;
    delete newMilestone.quarter;
    delete newMilestone.tasks;
    newMilestone.category = milestone.category;
    delete newMilestone.activityList;
    delete newMilestone.updatedAt;
    delete newMilestone.transactionHash;
    delete newMilestone.budgetStatus;
    delete newMilestone.blockchainStatus;
    return newMilestone;
  },

  deleteFieldsFromActivities(activities) {
    // TODO: check this
    return activities.map(activity => {
      activity.reviewCriteria = 'review criteria';
      activity.description = activity.tasks;
      // delete activity.tasks;
      // delete activity.signsOfSuccess;
      // delete activity.impactCriterion;
      return activity;
    });
  },

  /**
   * Receives an excel file, saves it and creates the Milestones
   * associated to the Project passed by parameter.
   *
   * Returns an array with all the Milestones created.
   * @param {*} file
   * @param {number} projectId
   */
  async createMilestones(file, projectId) {
    try {
      if (!file.data)
        throw new COAError(errors.milestone.CantProcessMilestonesFile);
      const response = await this.processMilestones(file.data);

      if (response.errors.length > 0) {
        logger.error(
          '[Milestone Service] :: Found errors while reading the excel file:',
          response.errors
        );
        return response;
      }

      const { milestones } = response;

      logger.info(
        '[Milestone Service] :: Creating Milestones for Project ID:',
        projectId
      );

      const savedMilestones = await Promise.all(
        milestones.map(async milestone => {
          if (!this.isMilestoneEmpty(milestone)) {
            // const isFirstMilestone = isEmpty(
            //   await this.milestoneDao.getMilestonesByProject(projectId)
            // );
            const activityList = milestone.activityList.slice(0);
            const milestoneWithoutFields = this.deleteFieldsFromMilestone(
              milestone
            );

            const savedMilestone = await this.milestoneDao.saveMilestone({
              milestone: milestoneWithoutFields,
              projectId
            });
            logger.info(
              '[Milestone Service] :: Milestone created:',
              savedMilestone
            );
            // create the activities for this milestone
            await this.activityService.createActivities(
              this.deleteFieldsFromActivities(activityList),
              savedMilestone.id
            );
            return savedMilestone;
          }
        })
      );

      return savedMilestones;
    } catch (err) {
      logger.error('[Milestone Service] :: Error creating Milestones:', err);
      throw new COAError(errors.milestone.ErrorCreatingMilestonesFromFile);
    }
  },

  async milestoneHasActivities(milestoneId) {
    const milestoneActivities = await this.milestoneDao.getMilestoneActivities(
      milestoneId
    );
    return !isEmpty(milestoneActivities.activities);
  },

  /**
   * Receives a Milestone and populates them with its Activities
   *
   * @param {object} milestone
   * @returns milestone with activities
   */
  async getMilestoneActivities(milestone) {
    const milestoneTasks = await this.milestoneDao.getMilestoneActivities(
      milestone.id
    );
    return milestoneTasks;
  },

  /**
   * Process the excel file with the Milestones and Activities' information.
   *
   * Returns an array with all the information retrieved.
   * @param {Buffer} data buffer data from the excel file
   */
  async processMilestones(data) {
    const response = {
      milestones: [],
      errors: []
    };

    const { worksheet, cellKeys, nameMap } = readExcelData(data);

    // TODO: everything below this is a mess.
    //       We will need to refactor it eventually
    let milestone;
    let actualQuarter;
    const COLUMN_KEY = 0;

    const getStandardAttributes = row => {
      const entry = {};
      while (!isEmpty(row)) {
        const cell = row.shift();
        const value = worksheet[cell].v;
        const AtributeKey = xlsxConfigs.keysMap[cell[COLUMN_KEY]];
        entry[AtributeKey] = value;
      }
      return entry;
    };

    const pushErrorBuilder = rowNumber => msg => {
      response.errors.push({ rowNumber, msg });
    };

    while (!isEmpty(cellKeys)) {
      let rowNum = cellKeys[0].slice(1);
      const row = remove(cellKeys, k => k.slice(1) === rowNum);
      rowNum = parseInt(rowNum, 10);

      const pushError = pushErrorBuilder(rowNum);

      const quarter = worksheet[`${nameMap.quarter}${rowNum}`]
        ? worksheet[`${nameMap.quarter}${rowNum}`].v
        : false;

      if (quarter) {
        actualQuarter = quarter;
      }
      if (!milestone) {
        milestone = {};
        milestone.activityList = [];
      }

      const type = worksheet[`${xlsxConfigs.typeColumnKey}${rowNum}`]
        ? worksheet[`${xlsxConfigs.typeColumnKey}${rowNum}`].v
        : false;
      if (type) {
        //  if is a milestone/activity row
        remove(
          row,
          col =>
            col[COLUMN_KEY] === nameMap.quarter ||
            col[COLUMN_KEY] === xlsxConfigs.typeColumnKey
        ); // remove timeline

        if (type.includes('Milestone')) {
          if (!actualQuarter) {
            pushError('Found a milestone without quarter');
          }

          if (!this.isMilestoneEmpty(milestone)) {
            if (milestone.activityList.length === 0) {
              pushError('Found a milestone without activities');
            }
          }

          milestone = {};
          milestone.activityList = [];

          Object.assign(milestone, getStandardAttributes(row));
          milestone.quarter = actualQuarter;
          this.verifyMilestone(milestone, pushError);
          response.milestones.push(milestone);
        } else if (type.includes('Activity')) {
          const activity = {};
          Object.assign(activity, getStandardAttributes(row));

          if (
            !this.isMilestoneValid(milestone) ||
            this.isMilestoneEmpty(milestone)
          ) {
            pushError(
              'Found an activity without an specified milestone or inside an invalid milestone'
            );
          }

          this.verifyActivity(activity, pushError);
          milestone.activityList.push(activity);
        }
      }
    }
    return response;
  },

  isMilestoneEmpty(milestone) {
    return milestone.activityList && Object.keys(milestone).length === 1;
  },

  isMilestoneValid(milestone) {
    if (
      !this.isMilestoneEmpty(milestone) &&
      (!milestone.quarter ||
        milestone.quarter === '' ||
        !milestone.tasks ||
        milestone.tasks === '' ||
        !milestone.impact ||
        milestone.impact === '')
    ) {
      return false;
    }

    return true;
  },

  canMilestoneUpdate(milestone) {
    if (
      milestone.quarter === '' ||
      milestone.tasks === '' ||
      milestone.impact === ''
    ) {
      return false;
    }
    return true;
  },

  verifyMilestone(milestone, pushError) {
    let valid = true;
    const toVerify = ['tasks', 'category'];
    toVerify.forEach(field => {
      if (!milestone[field] || milestone[field] === '') {
        valid = false;
        pushError(
          `Found a milestone without ${
            xlsxConfigs.columnNames[field]
          } specified`
        );
      }
    });

    return valid;
  },

  verifyActivity(activity, pushError) {
    let valid = true;
    const toVerify = [
      'tasks',
      'impact',
      'impactCriterion',
      'signsOfSuccess',
      'signsOfSuccessCriterion',
      'category',
      'keyPersonnel',
      'budget'
    ];

    toVerify.forEach(field => {
      if (!activity[field] || activity[field] === '') {
        valid = false;
        pushError(
          `Found an activity without ${
            xlsxConfigs.columnNames[field]
          } specified`
        );
      }
    });

    return valid;
  },

  /**
   * Returns an array of the projects' id that an oracle
   * has any of its activities assigned
   *
   * @param {number} oracleId
   * @returns array of project ids | error
   */
  async getProjectsAsOracle(oracleId) {
    logger.info(
      '[Milestone Service] :: Getting Milestones for Oracle ID',
      oracleId
    );
    try {
      const milestones = await this.activityService.getMilestonesAsOracle(
        oracleId
      );

      if (milestones.error) {
        return milestones;
      }

      const projects = await Promise.all(
        milestones.map(async milestoneId => {
          const milestone = await this.milestoneDao.findById(milestoneId);
          return milestone.project;
        })
      );

      return projects;
    } catch (error) {
      logger.error('[Milestone Service] :: Error getting Milestones:', error);
      throw Error('Error getting Milestones');
    }
  },

  /**
   * Returns an array with all milestones and its tasks of an specified project
   *
   * @param {number} projectId
   * @returns
   */
  async getAllMilestonesByProject(projectId) {
    logger.info(
      '[MilestoneService] :: Entering getAllMilestonesByProject method'
    );
    return this.milestoneDao.getMilestonesByProjectId(projectId);
  },

  // TODO: check if this method does anything different than getAllMilestonesByProject,
  //       delete if no
  async getMilestonesByProject(projectId) {
    logger.info(
      '[Milestone Service] :: Getting milestones for Project',
      projectId
    );
    try {
      const milestones = await this.milestoneDao.getMilestonesByProject(
        projectId
      );

      if (!milestones || milestones == null) {
        return milestones;
      }

      const milestonesWithActivities = await Promise.all(
        milestones.map(async milestone => {
          const milestoneWithActivity = await this.getMilestoneActivities(
            milestone
          );
          return milestoneWithActivity;
        })
      );

      return milestonesWithActivities;
    } catch (error) {
      logger.error('[Milestone Service] :: Error getting Milestones:', error);
      throw Error('Error getting Milestones');
    }
  },

  async tryCompleteMilestone(milestoneId) {
    try {
      logger.info(
        '[Milestone Service] :: Check if milestone is complete with id: ',
        milestoneId
      );
      const { activities } = await this.milestoneDao.getMilestoneActivities(
        milestoneId
      );
      let isCompleted = true;
      await activities.forEach(async activity => {
        const transactionConfirmed = activity.transactionHash
          ? await fastify.eth.isTransactionConfirmed(activity.transactionHash)
          : false;

        if (
          !transactionConfirmed ||
          activity.status !== activityStatus.COMPLETED
        ) {
          isCompleted = false;
        }
      });

      if (!isCompleted) {
        logger.info(
          '[Milestone Service] :: Milestone not completed. ID: ',
          milestoneId
        );
        return false;
      }

      logger.info('[Milestone Service] :: milestone complete: ', milestoneId);
      return this.milestoneDao.updateMilestoneStatus(
        milestoneId,
        activityStatus.COMPLETED
      );
    } catch (error) {
      logger.error('Error trying complete milestone', error);
    }
  },

  async startMilestonesOfProject(project) {
    const milestones = await this.getMilestonesByProject(project.id);
    fastify.eth.createMilestones({ milestones });
  },

  async getMilestoneById(milestoneId) {
    return this.milestoneDao.findById(milestoneId);
  },

  async getAllMilestones() {
    logger.info('[Milestone Service] :: Getting all milestones');

    try {
      const milestones = await this.milestoneDao.getAllMilestones();

      if (!milestones.length)
        logger.info('[Milestone Service] :: There are no milestones');

      return milestones;
    } catch (error) {
      logger.error('[Milestone Service] :: Error getting Milestones:', error);
      throw Error('Error getting Milestones');
    }
  },

  /**
   * Updates the budget transfer status of a milestone
   * @param {number} milestoneId
   * @param {number} budgetStatusId
   * @returns updated milestone | error
   */
  async updateBudgetStatus(milestoneId, budgetStatusId, user) {
    logger.info(
      `[Milestone Service] :: Updating Milestone ID ${milestoneId} budget status. 
      New status ID: ${budgetStatusId}`
    );
    try {
      if (!Object.values(milestoneBudgetStatus).includes(budgetStatusId)) {
        logger.error(
          `[Milestone Service] :: Budget status ID ${budgetStatusId} does not exist`
        );
        return {
          status: 404,
          error: 'Budget transfer status is not valid'
        };
      }

      const milestone = await this.milestoneDao.getMilestoneByIdWithProject(
        milestoneId
      );

      if (!milestone || milestone == null) {
        logger.error(
          `[Milestone Service] :: Milestone ID ${milestoneId} does not exist`
        );
        return {
          status: 404,
          error: 'Milestone does not exist'
        };
      }

      const { project } = milestone;
      if (project.status !== projectStatuses.EXECUTING) {
        logger.error(
          `[Milestone Service] :: Project ${project.id} is not EXECUTING`
        );
        return {
          error:
            'Milestone budget status cannot be updated. Project is not started.',
          status: 409
        };
      }

      const milestones = await this.getMilestonesByProject(project.id);
      const milestoneIndex = milestones.findIndex(m => m.id === milestone.id);
      const previousMilestone = milestoneIndex > 0 ? milestoneIndex - 1 : false;

      if (
        budgetStatusId === milestoneBudgetStatus.CLAIMABLE &&
        (milestone.budgetStatus !== milestoneBudgetStatus.BLOCKED ||
          (previousMilestone !== false &&
            milestones[previousMilestone].budgetStatus.id !==
              milestoneBudgetStatus.FUNDED))
      ) {
        logger.error(
          `[Milestone Service] :: Milestone ID ${milestoneId} is not blocked 
          or previous milestones are not funded`
        );
        return {
          status: 409,
          error:
            'All previous milestones need to be funded before making this milestone claimable.'
        };
      }

      if (
        budgetStatusId === milestoneBudgetStatus.CLAIMED &&
        milestone.budgetStatus !== milestoneBudgetStatus.CLAIMABLE
      ) {
        logger.error(
          `[Milestone Service] :: Milestone ID ${milestoneId} is not claimable.`
        );
        return {
          status: 409,
          error: 'Only claimable milestones can be claimed'
        };
      }

      if (
        budgetStatusId === milestoneBudgetStatus.FUNDED &&
        milestone.budgetStatus !== milestoneBudgetStatus.CLAIMED
      ) {
        logger.error(
          `[Milestone Service] :: Milestone ID ${milestoneId} needs to be claimed 
          in order to set the budget status to Funded`
        );
        return {
          status: 409,
          error:
            'The milestone needs to be Claimed in order to set the budget status to Funded'
        };
      }

      if (budgetStatusId === milestoneBudgetStatus.CLAIMED) {
        logger.info(
          `[Milestone Service] :: set claimed Milestone ID ${milestoneId} on Blockchain`
        );
        await fastify.eth.claimMilestone({
          sender: user.address,
          privKey: user.privKey,
          milestoneId,
          projectId: milestone.project.id
        });
      }

      if (budgetStatusId === milestoneBudgetStatus.FUNDED) {
        logger.info(
          `[Milestone Service] :: set funded Milestone ID ${milestoneId} on Blockchain`
        );
        await fastify.eth.setMilestoneFunded({
          milestoneId,
          projectId: milestone.project.id
        });
      }

      return milestone;
    } catch (error) {
      logger.error(
        '[Milestone Service] :: Error updating Milestone budget status:',
        error
      );
      throw Error('Error updating Milestone budget transfer status');
    }
  },

  async getAllBudgetStatus() {
    logger.info('[Milestone Service] :: Getting all available budget status');

    try {
      const budgetStatus = this.milestoneBudgetStatusDao.findAll();

      if (budgetStatus.length === 0) {
        logger.info('[Milestone Service] :: No budget status loaded');
      }

      return budgetStatus;
    } catch (error) {
      logger.error(
        '[Milestone Service] :: Error getting all available budget status:',
        error
      );
      throw Error('Error getting all available budget transfer status');
    }
  },

  async updateBlockchainStatus(milestoneId, status) {
    if (!Object.values(blockchainStatus).includes(status)) {
      return { error: 'Invalid Blockchain status' };
    }
    return this.milestoneDao.updateBlockchainStatus(milestoneId, status);
  },

  async getMilestonePreviewInfoOfProject(project) {
    try {
      let completedMilestones = 0;
      const milestones = await this.getMilestonesByProject(project.id);
      completedMilestones = milestones.filter(
        milestone => milestone.status.status === activityStatus.COMPLETED
      ).length;
      const hasOpenMilestones = completedMilestones < milestones.length;
      return {
        milestoneProgress: (completedMilestones * 100) / milestones.length,
        hasOpenMilestones
      };
    } catch (error) {
      return { error };
    }
  },

  /**
   * Add a claim for an existing project
   *
   * @param {number} taskId
   * @param {number} userId
   * @param {object} file
   * @param {boolean} approved
   * @returns transferId || error
   */
  async addClaim({ taskId, userId, file, approved }) {
    logger.info('[MilestoneService] :: Entering addClaim method');
    validateRequiredParams({
      method: 'addClaim',
      params: { userId, taskId, file, approved }
    });

    const { milestone, task } = await this.getMilestoneAndTaskFromId(taskId);
    const { projectId } = milestone;
    const { oracle } = task;

    if (oracle !== userId) {
      logger.info(
        `[MilestoneService] :: User ${userId} is not the oracle assigned for task ${taskId}`
      );
      throw new COAError(errors.task.MilestoneNotFound({ userId, taskId }));
    }

    // TODO only images?
    validateMtype(evidenceType, file);
    validatePhotoSize(file);

    // TODO Must we store this path? Where?
    logger.info(`[MilestoneService] :: Saving file of type '${evidenceType}'`);
    const filePath = await saveFile(evidenceType, file);
    logger.info(`[MilestoneService] :: File saved to: ${filePath}`);

    // TODO replace both fields with the correct information
    const claim = sha3(projectId, oracle, taskId);
    const proof = utils.id(file.name);

    await coa.addClaim(projectId, claim, proof, approved);

    return { taskId };
  }
};
