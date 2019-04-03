const UserDao = ({ userModel }) => ({
  async getUserById(id) {
    return userModel.findOne({ id }).populate('role');
  },

  async getUserByEmail(email) {
    return userModel.findOne({ email });
  },

  async createUser(user) {
    return userModel.create(user);
  }
});

module.exports = UserDao;
