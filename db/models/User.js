/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

/**
 * @description Represent a user of Circles Of Angels, this can be:
 *              Social entrepreneur, Funder, Oracle, Backoffice Administrator
 * @attribute `id`: user id in the business domain
 * @attribute `name`: name with which the user will be shown
 * @attribute `email`: email with which the user is registered
 * @attribute `pwd`: password with which the user logs
 * @attribute `roles`: role / roles that the user has in the tool
 *            (this can be for example Funder and Oracle at the same time)
 */
const { userRoles } = require('../../src/rest/util/constants');

module.exports = {
  identity: 'user',
  primaryKey: 'id',
  attributes: {
    firstname: { type: 'string', required: true },
    lastname: { type: 'string', required: true },
    email: { type: 'string', required: true },
    pwd: { type: 'string', required: true },
    address: { type: 'string', allowNull: true },
    createdAt: { type: 'string', autoCreatedAt: true, required: false },
    updatedAt: { type: 'string', autoUpdatedAt: true, required: false },
    id: { type: 'number', autoMigrations: { autoIncrement: true } },
    role: {
      type: 'string',
      validations: { isIn: Object.values(userRoles) },
      required: true
    },
    blocked: { type: 'boolean', defaultsTo: false, required: false },
    privKey: { type: 'string', required: true },
    transferBlockchainStatus: { type: 'number', required: true }
  },
  async findById(id) {
    return this.findOne(id);
  }
};
