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
    return this.model.updateOne(filter).set(data);
  },

  createUserWallet(userWallet, isActive) {
    return this.model.create({
      active: isActive,
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
  },

  async findByAddresses(addresses) {
    const userWallets = await this.model
      .find({ address: addresses })
      .populate('user');
    return userWallets
      ? userWallets.map(({ user, encryptedWallet, address, mnemonic }) => ({
          address,
          encryptedWallet,
          mnemonic,
          ...user
        }))
      : [];
  }
};
