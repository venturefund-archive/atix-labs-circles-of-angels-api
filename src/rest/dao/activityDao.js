const ActivityDao = () => ({
  activityModel: require('../server').fastify.models.activity,

  async saveActivity(activity, milestoneId) {
    activity.milestone = milestoneId;
    const createdActivity = await this.activityModel.create(activity);
    return createdActivity;
  }
});

module.exports = ActivityDao;
