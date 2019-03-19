module.exports = {
  identity: 'userProject',
  primaryKey: 'id',
  attributes: {
    user: {
      columnName: 'userId',
      model: 'user'
    },
    project: {
      columnName: 'projectId',
      model: 'project'
    },
    status: { type: 'number', required: true },
    id: { type: 'number', autoMigrations: { autoIncrement: true } }
  }
};
