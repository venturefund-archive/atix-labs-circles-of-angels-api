/**
 * COA PUBLIC LICENSE
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const { values, isEmpty, remove, invert } = require('lodash');
const XLSX = require('xlsx');
const { forEachPromise } = require('../util/promises');
const {
  activityStatus,
  milestoneBudgetStatus,
  blockchainStatus
} = require('../util/constants');

const milestoneService = ({
  fastify,
  milestoneDao,
  activityService,
  milestoneBudgetStatusDao
}) => ({
  /**
   * Creates a Milestone for an existing Project.
   *
   * @param {object} milestone
   * @param {number} projectId
   * @returns new milestone | error message
   */
  async createMilestone(milestone, projectId) {
    try {
      fastify.log.info(
        `[Milestone Service] :: Creating a new Milestone for Project ID ${projectId}: `,
        milestone
      );
      // TODO: should verify project existence and status <- inject projectDao <- inject userDao

      if (
        !this.isMilestoneEmpty(milestone) &&
        this.isMilestoneValid(milestone)
      ) {
        const savedMilestone = await milestoneDao.saveMilestone({
          milestone,
          projectId
        });

        fastify.log.info(
          '[Milestone Service] :: Milestone created:',
          savedMilestone
        );

        return savedMilestone;
      }

      fastify.log.error(
        '[Milestone Service] :: Milestone not valid',
        milestone
      );
      return {
        status: 409,
        error: 'Milestone is missing mandatory fields'
      };
    } catch (error) {
      fastify.log.error(
        '[Milestone Service] :: Error creating Milestone:',
        error
      );
      return { status: 500, error: 'Error creating Milestone' };
    }
  },

  /**
   * Receives an excel file, saves it and creates the Milestones
   * associated to the Project passed by parameter.
   *
   * Returns an array with all the Milestones created.
   * @param {*} milestonesPath
   * @param {number} projectId
   */
  async createMilestones(milestonesPath, projectId) {
    try {
      const response = await this.readMilestones(milestonesPath);

      if (response.errors.length > 0) {
        fastify.log.error(
          '[Milestone Service] :: Found errors while reading the excel file:',
          response.errors
        );
        return response;
      }

      const { milestones } = response;
      fastify.log.info(
        '[Milestone Service] :: Creating Milestones for Project ID:',
        projectId
      );

      const savedMilestones = [];

      // for each milestone call this function
      const createMilestone = (milestone, context) =>
        new Promise(resolve => {
          process.nextTick(async () => {
            if (!this.isMilestoneEmpty(milestone)) {
              const isFirstMilestone = isEmpty(
                await milestoneDao.getMilestonesByProject(projectId)
              );
              const activityList = milestone.activityList.slice(0);
              const savedMilestone = await milestoneDao.saveMilestone({
                milestone,
                projectId,
                budgetStatus: isFirstMilestone
                  ? milestoneBudgetStatus.CLAIMABLE
                  : milestoneBudgetStatus.BLOCKED
              });
              fastify.log.info(
                '[Milestone Service] :: Milestone created:',
                savedMilestone
              );
              context.push(savedMilestone);
              // create the activities for this milestone
              await activityService.createActivities(
                activityList,
                savedMilestone.id
              );
            }
            resolve();
          });
        });
      await forEachPromise(milestones, createMilestone, savedMilestones);

      return savedMilestones;
    } catch (err) {
      fastify.log.error(
        '[Milestone Service] :: Error creating Milestones:',
        err
      );
      throw Error('Error creating Milestone from file');
    }
  },

  /**
   * Updates a Milestone
   *
   * @param {object} milestone
   * @param {number} id
   * @returns updated milestone | error message
   */
  async updateMilestone(milestone, id) {
    try {
      fastify.log.info('[Milestone Service] :: Updating milestone:', milestone);

      if (
        !this.isMilestoneEmpty(milestone) &&
        this.isMilestoneValid(milestone)
      ) {
        const savedMilestone = await milestoneDao.updateMilestone(
          milestone,
          id
        );

        if (!savedMilestone || savedMilestone == null) {
          fastify.log.error(
            `[Milestone Service] :: Milestone ID ${id} does not exist`,
            savedMilestone
          );
          return {
            status: 404,
            error: 'Milestone does not exist'
          };
        }

        fastify.log.info(
          '[Milestone Service] :: Milestone updated:',
          savedMilestone
        );

        return savedMilestone;
      }

      fastify.log.error(
        '[Milestone Service] :: Milestone not valid',
        milestone
      );
      return {
        status: 409,
        error: 'Milestone is missing mandatory fields'
      };
    } catch (error) {
      fastify.log.error(
        '[Milestone Service] :: Error updating Milestone:',
        error
      );
      return { status: 500, error: 'Error updating Milestone' };
    }
  },

  async milestoneHasActivities(milestoneId) {
    const milestoneActivities = await milestoneDao.getMilestoneActivities(
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
    const milestoneActivities = await milestoneDao.getMilestoneActivities(
      milestone.id
    );
    const activities = [];

    await forEachPromise(
      milestoneActivities.activities,
      (activity, context) =>
        new Promise(resolve => {
          process.nextTick(async () => {
            const oracle = await activityService.getOracleFromActivity(
              activity.id
            );
            const activityWithType = {
              ...activity,
              type: 'Activity',
              quarter: milestone.quarter,
              oracle: oracle ? oracle.user : {}
            };

            context.push(activityWithType);
            resolve();
          });
        }),
      activities
    );

    const activitiesWithType = {
      ...milestoneActivities,
      activities
    };

    return activitiesWithType;
  },

  /**
   * Reads the excel file with the Milestones and Activities' information.
   *
   * Returns an array with all the information retrieved.
   * @param {string} file path
   */
  async readMilestones(file) {
    const response = {
      milestones: [],
      errors: []
    };

    let workbook = null;
    try {
      fastify.log.info('[Milestone Service] :: Reading Milestone excel:', file);
      workbook = XLSX.readFile(file, { raw: true });
    } catch (err) {
      fastify.log.error(
        '[Milestone Service] :: Error reading excel file:',
        err
      );
      throw Error('Error reading excel file');
    }

    if (workbook == null) {
      fastify.log.error(
        '[Milestone Service] :: Error reading Milestone excel file'
      );
      throw Error('Error reading excel file');
    }

    const sheetNameList = workbook.SheetNames;
    // get first worksheet
    const worksheet = workbook.Sheets[sheetNameList[0]];

    const xlsxConfigs = {
      keysMap: {
        A: 'quarter',
        C: 'tasks',
        D: 'impact',
        E: 'impactCriterion',
        F: 'signsOfSuccess',
        G: 'signsOfSuccessCriterion',
        H: 'budget',
        I: 'category',
        J: 'keyPersonnel'
      },
      typeColumnKey: 'B'
    };

    const nameMap = invert({ ...xlsxConfigs.keysMap });

    const range = XLSX.utils.decode_range(worksheet['!ref']);
    range.s.r = 2; // skip first two rows
    worksheet['!ref'] = XLSX.utils.encode_range(range);

    delete worksheet['!autofilter'];
    delete worksheet['!merges'];
    delete worksheet['!margins'];
    delete worksheet['!ref'];

    const cellKeys = Object.keys(worksheet);
    remove(cellKeys, k => k.slice(1) <= 4);
    let milestone;
    let actualQuarter;

    while (!isEmpty(cellKeys)) {
      let rowNum = cellKeys[0].slice(1);
      const row = remove(cellKeys, k => k.slice(1) === rowNum);
      rowNum = parseInt(rowNum, 10);
      const quarter = worksheet[`${nameMap.quarter}${rowNum}`]
        ? worksheet[`${nameMap.quarter}${rowNum}`].v
        : false;

      if (quarter) {
        milestone = {};
        milestone.activityList = [];
        actualQuarter = quarter;
      }

      const type = worksheet[`${xlsxConfigs.typeColumnKey}${rowNum}`]
        ? worksheet[`${xlsxConfigs.typeColumnKey}${rowNum}`].v
        : false;
      if (type) {
        //if is a milestone/activity row

        remove(
          row,
          col =>
            col[0] === nameMap.quarter || col[0] === xlsxConfigs.typeColumnKey
        ); //remove timeline

        if (type.includes('Milestone')) {
          if (!actualQuarter) {
            response.errors.push({
              rowNumber: rowNum,
              msg: 'Found a milestone without quarter'
            });
          }

          if (!this.isMilestoneEmpty(milestone)) {
            if (milestone.activityList.length === 0) {
              response.errors.push({
                rowNumber: rowNum,
                msg: 'Found a milestone without activities'
              });
            }
            response.milestones.push(milestone);
          }

          milestone = {};
          milestone.activityList = [];

          while (!isEmpty(row)) {
            const cell = row.shift();
            const value = worksheet[cell].v;
            const milestoneAtributeKey = xlsxConfigs.keysMap[cell[0]];
            milestone[milestoneAtributeKey] = value;
          }
          milestone.quarter = actualQuarter;
          this.verifyMilestone(milestone, response, rowNum);
        } else if (type.includes('Activity')) {
          const activity = {};

          while (!isEmpty(row)) {
            const cell = row.shift();
            const value = worksheet[cell].v;
            const milestoneAtributeKey = xlsxConfigs.keysMap[cell[0]];
            activity[milestoneAtributeKey] = value;
          }

          if (
            !this.isMilestoneValid(milestone) ||
            this.isMilestoneEmpty(milestone)
          ) {
            response.errors.push({
              rowNumber: rowNum,
              msg:
                'Found an activity without an specified milestone or inside an invalid milestone'
            });
          }

          this.verifyActivity(activity, response, rowNum);
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

  verifyMilestone(milestone, response, rowNumber) {
    let valid = true;
    if (!milestone.tasks || milestone.tasks === '') {
      valid = false;
      response.errors.push({
        rowNumber,
        msg: 'Found a milestone without Tasks'
      });
    }

    if (!milestone.impact || milestone.impact === '') {
      valid = false;
      response.errors.push({
        rowNumber,
        msg: 'Found a milestone without Expected Changes/ Social Impact Targets'
      });
    }

    return valid;
  },

  verifyActivity(activity, response, rowNumber) {
    let valid = true;

    if (activity.tasks === '') {
      valid = false;
      response.errors.push({
        rowNumber,
        msg: 'Found an activity without Tasks'
      });
    }

    if (activity.impact === '') {
      valid = false;
      response.errors.push({
        rowNumber,
        msg: 'Found an activity without Expected Changes/ Social Impact Targets'
      });
    }

    if (activity.impactCriterion === '') {
      valid = false;
      response.errors.push({
        rowNumber,
        msg:
          'Found an activity without a Review Criterion for the Expected Changes'
      });
    }

    if (activity.signsOfSuccess === '') {
      valid = false;
      response.errors.push({
        rowNumber,
        msg: 'Found an activity without Signs of Success'
      });
    }

    if (activity.signsOfSuccessCriterion === '') {
      valid = false;
      response.errors.push({
        rowNumber,
        msg:
          'Found an activity without a Review Criterion for the Signs of Success'
      });
    }

    if (activity.category === '') {
      valid = false;
      response.errors.push({
        rowNumber,
        msg: 'Found an activity without an Expenditure Category specified'
      });
    }

    if (activity.keyPersonnel === '') {
      valid = false;
      response.errors.push({
        rowNumber,
        msg: 'Found an activity without the Key Personnel Responsible specified'
      });
    }

    if (activity.budget === '') {
      valid = false;
      response.errors.push({
        rowNumber,
        msg: 'Found an activity without the Budget needed specified'
      });
    }

    return valid;
  },

  /**
   * Permanent remove milestone
   * @param milestoneId
   */
  deleteMilestone(milestoneId) {
    return milestoneDao.deleteMilestone(milestoneId);
  },

  /**
   * Returns an array of the projects' id that an oracle
   * has any of its activities assigned
   *
   * @param {number} oracleId
   * @returns array of project ids | error
   */
  async getProjectsAsOracle(oracleId) {
    fastify.log.info(
      '[Milestone Service] :: Getting Milestones for Oracle ID',
      oracleId
    );
    try {
      const milestones = await activityService.getMilestonesAsOracle(oracleId);

      if (milestones.error) {
        return milestones;
      }

      const projects = await Promise.all(
        milestones.map(async milestoneId => {
          const milestone = await milestoneDao.getMilestoneById(milestoneId);
          return milestone.project;
        })
      );

      return projects;
    } catch (error) {
      fastify.log.error(
        '[Milestone Service] :: Error getting Milestones:',
        error
      );
      throw Error('Error getting Milestones');
    }
  },

  async getMilestonesByProject(projectId) {
    fastify.log.info(
      '[Milestone Service] :: Getting milestones for Project',
      projectId
    );
    try {
      const milestones = await milestoneDao.getMilestonesByProject(projectId);

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
      fastify.log.error(
        '[Milestone Service] :: Error getting Milestones:',
        error
      );
      throw Error('Error getting Milestones');
    }
  },

  async tryCompleteMilestone(milestoneId) {
    try {
      fastify.log.info(
        '[Milestone Service] :: Check if milestone is complete with id: ',
        milestoneId
      );
      const { activities } = await milestoneDao.getMilestoneActivities(
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
        fastify.log.info(
          '[Milestone Service] :: Milestone not completed. ID: ',
          milestoneId
        );
        return false;
      }

      fastify.log.info(
        '[Milestone Service] :: milestone complete: ',
        milestoneId
      );
      return milestoneDao.updateMilestoneStatus(
        milestoneId,
        activityStatus.COMPLETED
      );
    } catch (error) {
      fastify.log.error('Error trying complete milestone', error);
    }
  },

  async startMilestonesOfProject(project) {
    const milestones = await this.getMilestonesByProject(project.id);
    await fastify.eth.createMilestones(milestones);
  },

  async getMilestoneById(milestoneId) {
    return milestoneDao.getMilestoneById(milestoneId);
  },

  async getAllMilestones() {
    fastify.log.info('[Milestone Service] :: Getting all milestones');
    try {
      const milestones = await milestoneDao.getAllMilestones();

      if (milestones.length === 0) {
        fastify.log.info('[Milestone Service] :: There are no milestones');
      }

      return milestones;
    } catch (error) {
      fastify.log.error(
        '[Milestone Service] :: Error getting Milestones:',
        error
      );
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
    fastify.log.info(
      `[Milestone Service] :: Updating Milestone ID ${milestoneId} budget status. 
      New status ID: ${budgetStatusId}`
    );
    try {
      const milestone = await milestoneDao.getMilestoneById(milestoneId);

      if (!milestone || milestone == null) {
        fastify.log.error(
          `[Milestone Service] :: Milestone ID ${milestoneId} does not exist`
        );
        return {
          status: 404,
          error: 'Milestone does not exist'
        };
      }

      const milestones = await this.getMilestonesByProject(milestone.project);
      const milestoneIndex = milestones.findIndex(m => m.id === milestone.id);
      const previousMilestone = milestoneIndex > 0 ? milestoneIndex - 1 : false;

      if (!Object.values(milestoneBudgetStatus).includes(budgetStatusId)) {
        fastify.log.error(
          `[Milestone Service] :: Budget status ID ${budgetStatusId} does not exist`
        );
        return {
          status: 404,
          error: 'Budget transfer status is not valid'
        };
      }

      if (
        budgetStatusId === milestoneBudgetStatus.CLAIMABLE &&
        (milestone.budgetStatus !== milestoneBudgetStatus.BLOCKED ||
          (previousMilestone &&
            milestones[previousMilestone].budgetStatus !==
              milestoneBudgetStatus.FUNDED))
      ) {
        fastify.log.error(
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
        fastify.log.error(
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
        fastify.log.error(
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
        fastify.log.info(
          `[Milestone Service] :: set claimed Milestone ID ${milestoneId} on Blockchain`
        );
        const txHash = await fastify.eth.claimMilestone(
          user.address,
          user.pwd,
          { milestoneId, projectId: milestone.project }
        );
        if (txHash.error) {
          fastify.log.error(
            `[Milestone Service] :: error setting claimed Milestone ID ${milestoneId} on Blockchain`
          );
        }
      }

      if (budgetStatusId === milestoneBudgetStatus.FUNDED) {
        fastify.log.info(
          `[Milestone Service] :: set funded Milestone ID ${milestoneId} on Blockchain`
        );
        const txHash = await fastify.eth.setMilestoneFunded({
          milestoneId,
          projectId: milestone.project
        });
        if (txHash.error) {
          fastify.log.error(
            `[Milestone Service] :: error setting funded Milestone ID ${milestoneId} on Blockchain`
          );
        }
      }

      return milestone;
    } catch (error) {
      fastify.log.error(
        '[Milestone Service] :: Error updating Milestone budget status:',
        error
      );
      throw Error('Error updating Milestone budget transfer status');
    }
  },

  async getAllBudgetStatus() {
    fastify.log.info(
      '[Milestone Service] :: Getting all available budget status'
    );

    try {
      const budgetStatus = milestoneBudgetStatusDao.findAll();

      if (budgetStatus.length === 0) {
        fastify.log.info('[Milestone Service] :: No budget status loaded');
      }

      return budgetStatus;
    } catch (error) {
      fastify.log.error(
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
    return milestoneDao.updateBlockchainStatus(milestoneId, status);
  }
});

module.exports = milestoneService;
