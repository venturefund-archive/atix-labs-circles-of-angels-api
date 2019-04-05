module.exports = {
  identity: 'oracle_activity',
  primaryKey: 'id',
  attributes: {
    user: {
      columnName: 'userId',
      model: 'user'
    },
    activity: {
      columnName: 'activityId',
      model: 'activity'
    },
    id: { type: 'number', autoMigrations: { autoIncrement: true } }
  }
};
