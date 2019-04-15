/**
 *@description Representa un activity de un determinado milestone
 *@attribute `id`: id of the activty
 *@attribute `milestoneId`: id of the milestone to which they belong
 *@attribute `tasks`: tasks to be performed in the current milestone
 *@attribute `impact`: expected changes after the end of the
 *@attribute `impactCriterion`: documentation activity or evidence of the impact achieved
 *@attribute `signsOfSuccess`: signs indicating that the activity was successful
 *@attribute `signsOfSuccessCriterion`: documentation or evidence that the activity was completed
 *@attribute `category`: category
 *@attribute `keyPersonnel`: member of the team responsible for each task to be performed
 *@attribute `budget`: budget with which it is counted
 *@attribute `status`: actual status of activity
 */
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
    status: {
      columnName: 'status',
      model: 'milestone_activity_status'
    },
    createdAt: { type: 'string', autoCreatedAt: true, required: false },
    updatedAt: { type: 'string', autoUpdatedAt: true, required: false },
    id: { type: 'number', autoMigrations: { autoIncrement: true } }
  }
};
