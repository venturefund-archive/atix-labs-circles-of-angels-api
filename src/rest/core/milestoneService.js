const { values, isEmpty } = require('lodash');
const { forEachPromise } = require('../util/promises');
const { activityStatus } = require('../util/constants');

const milestoneService = ({ fastify, milestoneDao, activityService }) => ({
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
              const activityList = milestone.activityList.slice(0);
              const savedMilestone = await milestoneDao.saveMilestone({
                milestone,
                projectId
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
      (activity, context) => {
        return new Promise(resolve => {
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
        });
      },
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
    const XLSX = require('xlsx');
    const response = {};
    response.errors = [];

    let workbook = null;
    try {
      fastify.log.info('[Milestone Service] :: Reading Milestone excel:', file);
      workbook = XLSX.readFile(file);
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

    const range = XLSX.utils.decode_range(worksheet['!ref']);
    range.s.r = 2; // skip first two rows
    worksheet['!ref'] = XLSX.utils.encode_range(range);

    const milestonesJSON = XLSX.utils.sheet_to_json(worksheet).slice(1);

    response.milestones = [];
    const { milestones } = response;
    let milestone = {};
    let quarter = '';

    // parse the JSON array with the milestones data
    Object.values(milestonesJSON).forEach(row => {
      const rowNumber = row.__rowNum__ + 1;
      let activity = {};

      if ('Timeline' in row) {
        // found a quarter
        quarter = row.Timeline;
        milestone = {};
      } else if (row.__EMPTY.includes('Milestone')) {
        // found a milestone
        milestone = {};
        milestone.quarter = quarter;
        milestone.tasks = row.Tasks !== undefined ? row.Tasks : '';
        milestone.impact =
          row['Expected Changes/ Social Impact Targets'] !== undefined
            ? row['Expected Changes/ Social Impact Targets']
            : '';
        milestone.impactCriterion =
          row['Review Criterion '] !== undefined
            ? row['Review Criterion ']
            : '';
        milestone.signsOfSuccess =
          row['Signs of Success'] !== undefined ? row['Signs of Success'] : '';
        milestone.signsOfSuccessCriterion =
          row['Review Criterion _1'] !== undefined
            ? row['Review Criterion _1']
            : '';
        milestone.category =
          row['Expenditure Category'] !== undefined
            ? row['Expenditure Category']
            : '';
        milestone.keyPersonnel =
          row['Key Personnel Responsible'] !== undefined
            ? row['Key Personnel Responsible']
            : '';
        milestone.budget =
          row['Budget needed'] !== undefined ? row['Budget needed'] : '';

        milestone.activityList = [];

        if (quarter !== '') {
          let error = false;

          if (!this.isMilestoneEmpty(milestone)) {
            if (milestone.tasks === '') {
              error = true;
              response.errors.push({
                rowNumber,
                msg: 'Found a milestone without Tasks'
              });
            }
            if (milestone.impact === '') {
              error = true;
              response.errors.push({
                rowNumber,
                msg:
                  'Found a milestone without Expected Changes/ Social Impact Targets'
              });
            }
          }

          if (!error) {
            milestones.push(milestone);
          }
        } else {
          response.errors.push({
            rowNumber,
            msg: 'Found a milestone without an specified quarter'
          });
        }
      } else if (row.__EMPTY.includes('Activity')) {
        // found an activity
        activity = {};
        activity.tasks = row.Tasks !== undefined ? row.Tasks : '';
        activity.impact =
          row['Expected Changes/ Social Impact Targets'] !== undefined
            ? row['Expected Changes/ Social Impact Targets']
            : '';
        activity.impactCriterion =
          row['Review Criterion '] !== undefined
            ? row['Review Criterion ']
            : '';
        activity.signsOfSuccess =
          row['Signs of Success'] !== undefined ? row['Signs of Success'] : '';
        activity.signsOfSuccessCriterion =
          row['Review Criterion _1'] !== undefined
            ? row['Review Criterion _1']
            : '';
        activity.category =
          row['Expenditure Category'] !== undefined
            ? row['Expenditure Category']
            : '';
        activity.keyPersonnel =
          row['Key Personnel Responsible'] !== undefined
            ? row['Key Personnel Responsible']
            : '';
        activity.budget =
          row['Budget needed'] !== undefined ? row['Budget needed'] : '';

        if (!values(activity).every(isEmpty)) {
          const validActivity = this.verifyActivity(
            activity,
            response,
            rowNumber
          );
          if (
            !this.isMilestoneEmpty(milestone) &&
            this.isMilestoneValid(milestone)
          ) {
            if (validActivity) {
              milestone.activityList.push(activity);
            }
          } else {
            response.errors.push({
              rowNumber,
              msg:
                'Found an activity without an specified milestone or inside an invalid milestone'
            });
          }
        }
      }
    });

    fastify.log.info(
      '[Milestone Service] :: Milestones data retrieved from file:',
      milestones
    );

    let valid = false;
    await milestones.forEach(m => {
      if (!this.isMilestoneEmpty(m)) {
        if (!isEmpty(m.activityList)) {
          valid = true;
        }
      }
    });
    if (!valid) {
      response.errors.push({
        rowNumber: 1,
        msg:
          'Could not find any valid activities. There should be at least one.'
      });
    }

    return response;
  },

  isMilestoneEmpty(milestone) {
    let empty = true;
    Object.entries(milestone).forEach(entry => {
      if (
        entry[0] !== 'activityList' &&
        entry[0] !== 'quarter' &&
        entry[1] !== ''
      ) {
        empty = false;
      }
    });
    return empty;
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
          !transactionConfirmed &&
          activity.status !== activityStatus.COMPLETED
        ) {
          isCompleted = false;
        }
      });
      if (isCompleted)
        fastify.log.info(
          '[Milestone Service] :: milestone complete: ',
          milestoneId
        );
      return milestoneDao.updateMilestoneStatus(
        milestoneId,
        activityStatus.COMPLETED
      );
    } catch (error) {
      console.error(error);
      fastify.log.error('Error trying complete milestone');
    }
  },

  async startMilestonesOfProject(project, owner) {
    const milestones = await this.getMilestonesByProject(project.id);
    milestones.forEach(async milestone => {
      await fastify.eth.createMilestone(owner.address, {
        milestoneId: milestone.id,
        projectId: project.id,
        budget: milestone.budget,
        description: milestone.tasks
      });
      const activities = await this.getMilestoneActivities(milestone);

      activities.activities.forEach(async activity => {
        const oracle = await activityService.getOracleFromActivity(activity.id);
        await fastify.eth.createActivity(owner.address, {
          activityId: activity.id,
          milestoneId: milestone.id,
          projectId: project.id,
          oracleAddress: oracle.user.address,
          description: activity.tasks
        });
      });
    });
  },

  async getMilestoneById(milestoneId) {
    return milestoneDao.getMilestoneById(milestoneId);
  },

  async getAllMilestones() {
    fastify.log.info('[Milestone Service] :: Getting all milestones');
    try {
      const milestones = await milestoneDao.getAllMilestones();

      if (!milestones || milestones == null) {
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
  }
});

module.exports = milestoneService;
