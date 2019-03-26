const UserDao = ({ userModel }) => ({
  async getUserById({ id }) {
    return (await userModel.find({ id }).limit(1))[0];
  },

  async getUserByEmail(email) {
    return userModel.findOne({ email });
  }
});

module.exports = UserDao;
