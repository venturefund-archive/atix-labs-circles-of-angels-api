const UserDao = ({ userModel }) => {
  return {
    async getUserById({ id }) {
      return userModel.findById(id);
    }
  };
};

module.exports = UserDao;
