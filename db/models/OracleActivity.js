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
    status: { type: 'number', required: true },
    id: { type: 'number', autoMigrations: { autoIncrement: true } }
  }
};
