/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const { userRoles } = require('../util/constants');

const UserDao = ({ userModel }) => ({
  async getUserById(id) {
    return userModel.findOne({ id }).populate('role');
  },

  async getUserByEmail(email) {
    return userModel.findOne(
      {
        email: email.toLowerCase()
      }
    ).populate('role');
  },

  async createUser(user) {
    const createdUser = await userModel.create(user);
    return createdUser;
  },

  async getOracles() {
    return userModel.find({ role: 4 }).populate('role');
  },

  async updateUser(id, user) {
    const updatedUser = await userModel.updateOne({ id }).set({ ...user });
    return updatedUser;
  },

  async getUsers() {
    return userModel
      .find({
        where: { role: { '!=': userRoles.BO_ADMIN } }
      })
      .populate('role')
      .populate('registrationStatus');
  },

  async updatePasswordByMail(email, pwd) {
    return userModel.updateOne(
      {
        where: {
          email: email.toLowerCase()
        }
      }
    ).set({ pwd });
  },

  async updateTransferBlockchainStatus(userId, status) {
    return userModel
      .updateOne({ id: userId })
      .set({ transferBlockchainStatus: status });
  }
});

module.exports = UserDao;
