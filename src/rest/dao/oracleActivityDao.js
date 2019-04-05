/**
 * Create a unique reference user-activity
 */
const assignOracleToActivity = oracleActivityModel => async (
  userId,
  activityId
) => {
  const assign = oracleActivityModel.create({
    user: userId,
    activity: activityId,
    status: 0
  });
  return assign;
};

module.exports = oracleActivityModel => ({
  assignOracleToActivity: assignOracleToActivity(oracleActivityModel)
});
