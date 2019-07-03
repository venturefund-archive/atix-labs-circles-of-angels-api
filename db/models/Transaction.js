/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

module.exports = {
  identity: 'transaction',
  primaryKey: 'id',
  attributes: {
    sender: { type: 'string', required: false },
    receiver: { type: 'string', required: false },
    data: { type: 'string', required: true },
    status: { type: 'number', required: true },
    transactionHash: { type: 'string', required: false },
    createdAt: { type: 'string', autoCreatedAt: true, required: false },
    updatedAt: { type: 'string', autoUpdatedAt: true, required: false },
    id: { type: 'number', autoMigrations: { autoIncrement: true } },
    privKey: { type: 'string', required: false, allowNull: true },
    type: { type: 'string', required: false, allowNull: true },
    projectId: { type: 'number', required: false, allowNull: true },
    milestoneId: { type: 'number', required: false, allowNull: true },
    activityId: { type: 'number', required: false, allowNull: true }
  }
};
