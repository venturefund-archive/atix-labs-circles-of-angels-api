/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

module.exports = {
  async findActiveById(id) {
    return this.model.findOne({ id }).populate('user');
  },

  findActiveByUserId(userId) {
    return this.model.findOne({ userId, active: true }).populate('user');
  },

  updateWallet(filter, data) {
    try {
      return this.model.updateOne(filter).set(data);
    } catch (error) {
      throw error;
    }
  },

  createUserWallet(userWallet) {
    return this.model.create({
      active: true,
      ...userWallet
    });
  },

  async findByAddress(address) {
    const userWallet = await this.model.findOne({ address }).populate('user');
    if (!userWallet) {
      return;
    }
    const { user, encryptedWallet, mnemonic } = userWallet;
    return { address, encryptedWallet, mnemonic, ...user };
  }
};
