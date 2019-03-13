const fastify = require('fastify')({ logger: true });
const { forEachPromise } = require('../util/promises');

const activityService = () => ({
  /**
   * Creates new Activities and associates them to the Milestone passed by parameter.
   *
   * Returns an array with all the Activities created.
   * @param {array} activities
   * @param {number} milestoneId
   */
  async createActivities(activities, milestoneId) {
    const activityDao = require('../dao/activityDao')();

    fastify.log.info(
      '[Activity Service] :: Creating Activities for Milestone ID:',
      milestoneId
    );

    const savedActivities = [];

    // for each activity call this function
    const createActivity = (activity, context) =>
      new Promise(resolve => {
        process.nextTick(async () => {
          if (!this.isEmpty(activity)) {
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

  isEmpty(activity) {
    let empty = true;
    Object.values(activity).forEach(v => {
      if (v !== '') {
        empty = false;
      }
    });
    return empty;
  }
});

module.exports = activityService;
