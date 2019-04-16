/**
 * Create a unique reference user-activity
 */
const assignOracleToActivity = oracleActivityModel => async (
  userId,
  activityId
) => {
  const assign = oracleActivityModel.create({
    user: userId,
    activity: activityId
  });
  return assign;
};

const unassignOracleToActivity = oracleActivityModel => async activityId => {
  const response = oracleActivityModel
    .destroy({ activity: activityId })
    .fetch();
  return response;
};

const getOracleFromActivity = oracleActivityModel => async activityId => {
  const oracle = oracleActivityModel
    .findOne({ activity: activityId })
    .populate('user');
  return oracle;
};

const getActivitiesByOracle = oracleActivityModel => async oracleId => {
  const activities = oracleActivityModel
    .find({ user: oracleId })
    .populate('activity');
  return activities;
};

module.exports = oracleActivityModel => ({
  assignOracleToActivity: assignOracleToActivity(oracleActivityModel),
  getOracleFromActivity: getOracleFromActivity(oracleActivityModel),
  unassignOracleToActivity: unassignOracleToActivity(oracleActivityModel),
  getActivitiesByOracle: getActivitiesByOracle(oracleActivityModel)
});
