const UserDao = ({ userModel }) => ({
  async getUserById({ id }) {
    return (await userModel.find({ id }).limit(1))[0];
  }
});

module.exports = UserDao;
