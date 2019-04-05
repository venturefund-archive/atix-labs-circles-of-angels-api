/**
 * @description Represents a relationship between a user and a project
 * @attribute `status`: state in which the user is with respect to a project
 * @attribute `userId`: user id
 * @attribute `projectId`: project id
 */
module.exports = {
  identity: 'user_project',
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
