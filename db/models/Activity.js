module.exports = {
  identity: 'activity',
  primaryKey: 'id',
  attributes: {
    tasks: { type: 'string', required: false },
    impact: { type: 'string', required: false },
    impactCriterion: { type: 'string', required: false },
    signsOfSuccess: { type: 'string', required: false },
    signsOfSuccessCriterion: { type: 'string', required: false },
    category: { type: 'string', required: false },
    keyPersonnel: { type: 'string', required: false },
    budget: { type: 'string', required: false },
    milestone: {
      columnName: 'milestoneId',
      model: 'milestone'
    },
    id: { type: 'number', autoMigrations: { autoIncrement: true } }
  }
};
