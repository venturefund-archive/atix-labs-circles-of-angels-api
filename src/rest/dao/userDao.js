const UserDao = ({ userModel }) => {
  return {
    async getUserById({ id }) {
      return (await userModel.find({ id }).limit(1))[0];
    }
  };
};

module.exports = UserDao;
