const userService = ({ fastify, userDao }) => ({
  async getUserById({ id }) {
    return userDao.getUserById({ id });
  }
});

module.exports = userService;
