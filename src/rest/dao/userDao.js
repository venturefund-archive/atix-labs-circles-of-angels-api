const { isEmpty } = require('lodash');

const UserDao = ({ userModel }) => ({
  async getUserById(id) {
    return userModel.findOne({ id }).populate('role');
  },

  async getUserByEmail(email) {
    return userModel.findOne({ email }).populate('role');
  },

  async createUser(user) {
    const existentUser = await userModel.find({ email: user.email });
    if (!isEmpty(existentUser)) return {};
    return userModel.create(user);
  },

  async getOracles() {
    return userModel.find({ role: 4 }).populate('role');
  }
});

module.exports = UserDao;
