/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

module.exports = {
  // only active user wallet
  async findActiveById(id) {
    return this.model.findOne({ id }).populate('user');
  },

  async findActiveByUser(userId) {
    return this.model.findOne({ userId, active: true }).populate('user');
  },

  async createUserWallet(userWallet) {
    await this.model
      .updateOne({
        user: userWallet.userId,
        active: true
      })
      .set({ active: false });

    const createdUserWallet = await this.model.create({
      active: true,
      ...userWallet
    });
    return createdUserWallet;
  },

  async findByAddress(address) {
    const userWallet = await this.model.findOne({ address }).populate('user');
    if (!userWallet) {
      return;
    }
    const { user, encryptedWallet, mnemonic } = userWallet;
    return { address, encryptedWallet, mnemonic, ...user };
  },

  // all user wallets
  async getUserWalletsByUserId(userId) {
    return this.model
      .find({ userId })
      .populate('user')
      .sort('createdAt ASC');
  },

  async getAllUserWallets(userFilters) {
    return this.model
      .find()
      .populate('user', userFilters)
      .sort('createdAt ASC');
  }
};
