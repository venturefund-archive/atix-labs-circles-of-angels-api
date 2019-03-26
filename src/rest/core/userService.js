const bcrypt = require('bcrypt');

const userService = ({ fastify, userDao }) => ({
  async getUserById({ id }) {
    return userDao.getUserById({ id });
  },

  /**
   * Receives the user's email and password and tries to authenticate
   *
   * @param {string} email user's email
   * @param {string} pwd user's password
   * @returns user information | error message
   */
  async login(email, pwd) {
    const user = await userDao.getUserByEmail(email);

    if (user && user !== null) {
      fastify.log.info('[User Service] :: User found in database:', user);

      // if an user was found with that email, verify with encrypted pwd
      const match = await bcrypt.compare(pwd, user.pwd);

      if (match) {
        fastify.log.info('[User Service] :: User authenticated:', user.email);

        const authenticatedUser = {
          username: user.username,
          email: user.email,
          id: user.id
        };

        return authenticatedUser;
      }

      // error if wrong password
      fastify.log.error('[User Service] :: Password failed to authenticate');
    } else {
      // error if user not found
      fastify.log.error('[User Service] :: User not found in database:', email);
    }

    return { error: 'Login failed. Incorrect user or password.' };
  }
});

module.exports = userService;
