/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

/* eslint-disable prefer-destructuring */
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
    let userWalletSelected;
    const userWallets = await this.model
      .find({ address })
      .sort({ createdAt: 'desc' })
      .populate('user');
    if (!userWallets.length) {
      return;
    }
    if (userWallets.some(wallet => wallet.active)) {
      userWalletSelected = userWallets.find(wallet => wallet.active);
    } else {
      userWalletSelected = userWallets[0];
    }
    const { user, encryptedWallet, mnemonic } = userWalletSelected;
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
