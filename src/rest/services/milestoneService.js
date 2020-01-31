/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const { isEmpty, remove } = require('lodash');
const { xlsxConfigs, projectStatuses } = require('../util/constants');
const checkExistence = require('./helpers/checkExistence');
const validateRequiredParams = require('./helpers/validateRequiredParams');
const validateOwnership = require('./helpers/validateOwnership');
const COAError = require('../errors/COAError');
const errors = require('../errors/exporter/ErrorExporter');
const { readExcelData } = require('../util/excelParser');

const logger = require('../logger');

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
      activity.reviewCriteria = activity.impactCriterion;
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
    if (!file.data)
      throw new COAError(errors.milestone.CantProcessMilestonesFile);
    try {
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
  }
};
