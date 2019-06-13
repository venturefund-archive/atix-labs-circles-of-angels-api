/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

/**
 * @description Represents a bank transfer register
 * @attribute `transferId`: Bank transfer recipt
 * @attribute `senderId`: id of the user who sends
 * @attribute `destinationAccount`: id of the user that receives
 * @attribute `projectId`: the project id to which this bank transfer belongs
 * @attribute `amount`: amount of money transferred
 * @attribute `currency`: currency in which the transfer was made
 */
module.exports = {
  identity: 'fund_transfer',
  primaryKey: 'id',
  attributes: {
    transferId: { type: 'string', required: true },
    sender: {
      columnName: 'senderId',
      model: 'user'
    },
    destinationAccount: { type: 'string', required: true },
    amount: { type: 'number', required: true },
    currency: { type: 'string', required: true },
    project: {
      columnName: 'projectId',
      model: 'project'
    },
    state: { type: 'number', defaultsTo: 0 },
    createdAt: { type: 'string', autoCreatedAt: true },
    updatedAt: { type: 'string', autoUpdatedAt: true },
    id: { type: 'number', autoMigrations: { autoIncrement: true } }
  }
};
