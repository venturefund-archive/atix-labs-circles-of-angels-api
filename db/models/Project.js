module.exports = {
  identity: 'project',
  primaryKey: 'id',
  attributes: {
    projectName: { type: 'string', required: true },
    mission: { type: 'string', required: true },
    problemAddressed: { type: 'string', required: true },
    ownerId: { type: 'number', required: true },
    location: { type: 'string', required: true },
    timeframe: { type: 'string', required: true },
    photo: { type: 'string', required: true },
    status: { type: 'number', defaultsTo: 0 },
    createdAt: { type: 'string', autoCreatedAt: true, required: false },
    updatedAt: { type: 'string', autoUpdatedAt: true, required: false },
    milestones: {
      collection: 'milestone',
      via: 'project'
    },
    id: { type: 'number', autoMigrations: { autoIncrement: true } }
  },

  async createProject(project) {
    return this.create(project);
  }
};
