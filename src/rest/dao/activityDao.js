const ActivityDao = ({ activityModel }) => ({
  async saveActivity(activity, milestoneId) {
    activity.milestone = milestoneId;
    const createdActivity = await activityModel.create(activity);
    return createdActivity;
  }
});

module.exports = ActivityDao;
