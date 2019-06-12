/**
 * COA PUBLIC LICENSE
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

/**
 *@description Represents a milestone of a project in a given quearter
 *@attribute `id`: milestone id
 *@attribute `projectId`: id of the project to which it belongs
 *@attribute `quarter`: quarter to which it belongs
 *@attribute `tasks`: tasks to be performed in the current milestone
 *@attribute `impact`: expected changes after the conclusion of the
 *@attribute `impactCriterion`: documentation activity or evidence of the impact achieved
 *@attribute `signsOfSuccess`: signs indicating that the activity was successful
 *@attribute `signsOfSuccessCriterion`: documentation or evidence that the activity was completed
 *@attribute `category`: category
 *@attribute `keyPersonnel`: member of the team responsible for each task to be performed
 *@attribute `budget`: budget with which it is counte
 *@attribute `status`: actual status of milestone
 */

module.exports = {
  identity: 'milestone',
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
    quarter: { type: 'string', required: true },
    project: {
      columnName: 'projectId',
      model: 'project'
    },
    activities: {
      collection: 'activity',
      via: 'milestone'
    },
    status: {
      columnName: 'status',
      model: 'milestone_activity_status'
    },
    createdAt: { type: 'string', autoCreatedAt: true, required: false },
    updatedAt: { type: 'string', autoUpdatedAt: true, required: false },
    transactionHash: { type: 'string', required: false },
    id: { type: 'number', autoMigrations: { autoIncrement: true } },
    budgetStatus: {
      columnName: 'budgetStatus',
      model: 'milestone_budget_status'
    },
    blockchainStatus: {
      columnName: 'blockchainStatus',
      model: 'blockchain_status'
    }
  }
};
