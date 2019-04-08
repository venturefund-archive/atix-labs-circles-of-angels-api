const { values, isEmpty } = require('lodash');
const { forEachPromise } = require('../util/promises');

const activityService = ({ fastify, activityDao, oracleActivityDao }) => ({
  /**
   * Creates an Activity for an existing Milestone
   *
   * @param {object} activity
   * @param {number} milestoneId
   * @returns new activity | error message
   */
  async createActivity(activity, milestoneId) {
    try {
      fastify.log.info(
        `[Activity Service] :: Creating a new Activity for Milestone ID ${milestoneId}: `,
        activity
      );
      // TODO: should verify milestone existence and project status ????

      if (this.verifyActivity(activity)) {
        const savedActivity = await activityDao.saveActivity(
          activity,
          milestoneId
        );

        fastify.log.info(
          '[Activity Service] :: Activity created:',
          savedActivity
        );

        return savedActivity;
      }

      fastify.log.error('[Activity Service] :: Activity not valid', activity);
      return {
        status: 409,
        error: 'Activity is missing mandatory fields'
      };
    } catch (error) {
      fastify.log.error(
        '[Activity Service] :: Error creating Activity:',
        error
      );
      return { status: 500, error: 'Error creating Activity' };
    }
  },

  /**
   * Creates new Activities and associates them to the Milestone passed by parameter.
   *
   * Returns an array with all the Activities created.
   * @param {array} activities
   * @param {number} milestoneId
   */
  async createActivities(activities, milestoneId) {
    fastify.log.info(
      '[Activity Service] :: Creating Activities for Milestone ID:',
      milestoneId
    );

    const savedActivities = [];

    // for each activity call this function
    const createActivity = (activity, context) =>
      new Promise(resolve => {
        process.nextTick(async () => {
          if (!values(activity).every(isEmpty)) {
            const savedActivity = await activityDao.saveActivity(
              activity,
              milestoneId
            );
            fastify.log.info(
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
   * Updates an Activity
   *
   * @param {object} activity
   * @param {number} id
   */
  async updateActivity(activity, id) {
    try {
      fastify.log.info('[Activity Service] :: Updating activity:', activity);

      if (this.verifyActivity(activity)) {
        const savedActivity = await activityDao.updateActivity(activity, id);

        if (!savedActivity || savedActivity == null) {
          fastify.log.error(
            `[Activity Service] :: Activity ID ${id} does not exist`,
            savedActivity
          );
          return {
            status: 404,
            error: 'Activity does not exist'
          };
        }

        fastify.log.info(
          '[Activity Service] :: Activity updated:',
          savedActivity
        );

        return savedActivity;
      }

      fastify.log.error('[Activity Service] :: Activity not valid', activity);
      return {
        status: 409,
        error: 'Activity is missing mandatory fields'
      };
    } catch (error) {
      fastify.log.error(
        '[Activity Service] :: Error updating Activity:',
        error
      );
      return { status: 500, error: 'Error updating Activity' };
    }
  },

  verifyActivity(activity) {
    let valid = true;

    if (
      !activity.tasks ||
      !activity.impact ||
      !activity.impactCriterion ||
      !activity.signsOfSuccess ||
      !activity.signsOfSuccessCriterion ||
      !activity.category ||
      !activity.keyPersonnel ||
      !activity.budget
    ) {
      valid = false;
    }

    return valid;
  },

  /**
   * Delete an activity with id
   * @param {number} activityId
   */
  deleteActivity(activityId) {
    return activityDao.deleteActivity(activityId);
  },

  /**
   * Create a oracle reference between a user and activity
   * @param {number} userId
   * @param {number} activityId
   */
  assignOracleToActivity(userId, activityId) {
    return oracleActivityDao.assignOracleToActivity(userId, activityId);
  }
});

module.exports = activityService;
