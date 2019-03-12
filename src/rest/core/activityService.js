const fastify = require('fastify')({ logger: true });

const activityService = () => {
  return {
    async createActivities(activities, milestoneId) {
      const activityDao = require('../dao/activityDao')();

      const savedActivities = [];
      Object.values(activities).forEach(async activity => {
        if (!this.isEmpty(activity)) {
          const savedActivity = await activityDao.saveActivity(
            activity,
            milestoneId
          );
          fastify.log.info(
            '[Activity Service] :: Activity Created: ',
            savedActivity
          );
          savedActivities.push(savedActivity);
        }
      });

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
  };
};

module.exports = activityService;
