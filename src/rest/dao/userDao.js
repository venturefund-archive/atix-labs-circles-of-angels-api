/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const { userRoles } = require('../util/constants');

module.exports = {
  async getUserById(id) {
    // TODO delete this
    return this.model.findOne({ id });
  },

  async findById(id) {
    return this.model.findOne({ id });
  },

  async findByAddress(address) {
    return this.model.findOne({ address });
  },

  async getUserByEmail(email) {
    return this.model.findOne({ email: email.toLowerCase() });
  },

  async createUser(user) {
    const createdUser = await this.model.create(user);
    return createdUser;
  },

  async getFollowedProjects(id) {
    return this.model.findOne({ id }).populate('following');
  },

  async getAppliedProjects(id) {
    return this.model
      .findOne({ id })
      .populate('funding')
      .populate('monitoring');
  },

  async updateUser(id, user) {
    const updatedUser = await this.model.updateOne({ id }).set({ ...user });
    return updatedUser;
  },

  async updateUserByEmail(email, user) {
    const updatedUser = await this.model.updateOne({ email }).set({ ...user });
    return updatedUser;
  },

  async getUsers() {
    return this.model
      .find({ where: { role: { '!=': userRoles.COA_ADMIN } } })
      .sort('createdAt ASC');
  },

  async updatePasswordByMail(email, pwd) {
    return this.model
      .updateOne({ where: { email: email.toLowerCase() } })
      .set({ pwd });
  },

  async updateTransferBlockchainStatus(userId, status) {
    return this.model
      .updateOne({ id: userId })
      .set({ transferBlockchainStatus: status });
  }
};
