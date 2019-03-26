const UserDao = ({ userModel }) => ({
  async getUserById({ id }) {
    return (await userModel.find({ id }).limit(1))[0];
  },

  async getUserByEmail(email) {
    return userModel.findOne({ email });
  },

  async createUser(user) {
    return userModel.create(user);
  }
});

module.exports = UserDao;
