/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const { userRoles } = require('../util/constants');

module.exports = {
  async findById(id) {
    const user = await this.model.findOne({ id }).populate('wallets', {
      where: { active: true }
    });
    if (!user) {
      return;
    }
    if (!user.wallets.length) {
      return;
    }
    const { address, encryptedWallet, mnemonic } = user.wallets[0];
    delete user.wallets;
    return { address, encryptedWallet, mnemonic, ...user };
  },

  async getUserByEmail(email) {
    const user = await this.model.findOne({ email }).populate('wallets', {
      where: { active: true }
    });
    if (!user) {
      return;
    }
    if (!user.wallets.length) {
      return;
    }
    const { address, encryptedWallet, mnemonic } = user.wallets[0];
    delete user.wallets;
    return { address, encryptedWallet, mnemonic, ...user };
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
    const updatedUser = await this.model
      .updateOne({ where: { email: email.toLowerCase() } })
      .set({ ...user });
    return updatedUser;
  },

  async updatePasswordByMail(email, pwd) {
    return this.model
      .updateOne({ where: { email: email.toLowerCase() } })
      .set({ pwd });
  },

  /* eslint-disable no-param-reassign */
  async getUsers() {
    const users = await this.model
      .find({
        where: {
          role: { '!=': userRoles.COA_ADMIN }
        }
      })
      .populate('wallets', {
        where: { active: true }
      });
    return users.map(user => {
      if (!user.wallets.length) {
        return;
      }
      const { address, encryptedWallet, mnemonic } = user.wallets[0];
      delete user.wallets;
      return { address, encryptedWallet, mnemonic, ...user };
    });
  },

  async updateTransferBlockchainStatus(userId, status) {
    return this.model
      .updateOne({ id: userId })
      .set({ transferBlockchainStatus: status });
  },

  async removeUserById(id) {
    return this.model.destroy({ id });
  }
};
