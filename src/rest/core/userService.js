const bcrypt = require('bcrypt');

const userService = ({ fastify, userDao }) => ({
  async getUserById(id) {
    return userDao.getUserById(id);
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
          id: user.id,
          role: user.role
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
  },

  /**
   * Simple method to create an user with postman
   *
   * @param {string} username
   * @param {string} email
   * @param {string} pwd
   * @param {number} roleId
   * @returns new user | error
   */
  async createUser(username, email, pwd, role) {
    const hashedPwd = await bcrypt.hash(pwd, 10);

    const address = await fastify.eth.createAccount(hashedPwd);

    try {
      const user = {
        username,
        email,
        pwd: hashedPwd,
        role,
        address
      };

      const savedUser = await userDao.createUser(user);

      return savedUser;
    } catch (error) {
      return { error };
    }
  },

  /**
   * Receives a User's id and returns their role
   *
   * @param {number} userId
   * @returns user's role | error message
   */
  async getUserRole(userId) {
    const user = await userDao.getUserById(userId);

    if (!user || user == null) {
      fastify.log.error(
        `[User Service] :: User ID ${userId} not found in database`
      );
      return { error: 'User not found' };
    }

    if (user.role && user.role != null) {
      fastify.log.info(
        `[User Service] :: Found User ID ${user.id} with Role ${user.role.name}`
      );
      return user.role;
    }

    fastify.log.error(
      `[User Service] :: User ID ${userId} doesn't have a role`
    );
    // eslint-disable-next-line prettier/prettier
    return { error: "User doesn't have a role" };
  },

  /**
   * Returns a list of oracles users
   */
  async getOracles() {
    return userDao.getOracles();
  }
});

module.exports = userService;
