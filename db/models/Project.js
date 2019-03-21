module.exports = {
  identity: 'project',
  primaryKey: 'id',
  attributes: {
    projectName: { type: 'string', required: true },
    mission: { type: 'string', required: true },
    problemAddressed: { type: 'string', required: true },
    location: { type: 'string', required: true },
    timeframe: { type: 'string', required: true },
    pitchProposal: { type: 'string', required: true },
    faqLink: { type: 'string', required: true },
    coverPhoto: { type: 'string', required: true },
    cardPhoto: { type: 'string', required: true },
    goalAmount: { type: 'number', required: true },
    status: { type: 'number', defaultsTo: 0 },
    ownerId: { type: 'number', required: true },
    projectAgreement: { type: 'string', required: false },
    createdAt: { type: 'string', autoCreatedAt: true, required: false },
    updatedAt: { type: 'string', autoUpdatedAt: true, required: false },
    milestones: {
      collection: 'milestone',
      via: 'project'
    },
    id: { type: 'number', autoMigrations: { autoIncrement: true } }
  }
};
