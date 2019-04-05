const { values, isEmpty } = require('lodash');
const { forEachPromise } = require('../util/promises');

const activityService = ({ fastify, activityDao, oracleActivityDao }) => ({
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
            const savedActivity = await activityDao.saveActivity({
              activity,
              milestoneId
            });
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
