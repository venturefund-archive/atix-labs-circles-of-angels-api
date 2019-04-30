const { isEmpty } = require('lodash');

const UserDao = ({ userModel }) => ({
  async getUserById(id) {
    return userModel.findOne({ id }).populate('role');
  },

  async getUserByEmail(email) {
    return userModel.findOne({ email }).populate('role');
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
  }
});

module.exports = UserDao;
