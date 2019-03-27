const { values, isEmpty } = require('lodash');
const { forEachPromise } = require('../util/promises');
const configs = require('../../../config/configs');

const milestoneService = ({ fastify, milestoneDao, activityService }) => ({
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

  async getMilestoneActivities(milestone) {
    const milestoneActivities = milestoneDao.getMilestoneActivities(
      milestone.id
    );

    return milestoneActivities;
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
      (milestone.quarter === '' ||
        milestone.tasks === '' ||
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
  }
});

module.exports = milestoneService;
