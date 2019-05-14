module.exports = {
  identity: 'photo',
  primaryKey: 'id',
  attributes: {
    path: { type: 'string', required: true },
    createdAt: { type: 'string', autoCreatedAt: true, required: false },
    updatedAt: { type: 'string', autoUpdatedAt: true, required: false },
    projectExperience: {
      columnName: 'projectExperienceId',
      model: 'project_experience'
    },
    id: { type: 'number', autoMigrations: { autoIncrement: true } }
  }
};
