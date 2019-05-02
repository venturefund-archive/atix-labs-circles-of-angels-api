const bcrypt = require('bcrypt');
const { userRegistrationStatus } = require('../util/constants');

const userService = ({
  fastify,
  userDao,
  userRegistrationStatusDao,
  roleDao
}) => ({
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
          role: user.role,
          registrationStatus: user.registrationStatus
        };

        if (
          user.registrationStatus === userRegistrationStatus.PENDING_APPROVAL
        ) {
          fastify.log.error(
            `[User Service] :: User ID ${
              user.id
            } registration status is Pending Approval`
          );

          return {
            status: 409,
            error: 'User registration is still pending approval by the admin',
            user: authenticatedUser
          };
        }

        if (user.registrationStatus === userRegistrationStatus.REJECTED) {
          fastify.log.error(
            `[User Service] :: User ID ${
              user.id
            } registration status is Rejected`
          );

          return {
            status: 409,
            error: 'User registration was rejected by the admin',
            user: authenticatedUser
          };
        }

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
   * Creates a new user with basic information
   *
   * @param {string} username
   * @param {string} email
   * @param {string} pwd
   * @param {number} roleId
   * @returns new user | error
   */
  async createUser(username, email, pwd, role) {
    const hashedPwd = await bcrypt.hash(pwd, 10);

    const { address, privateKey } = await fastify.eth.createAccount();

    try {
      const existingUser = await userDao.getUserByEmail(email);

      if (existingUser) {
        fastify.log.error(
          `[User Service] :: User with email ${email} already exists.`
        );
        return {
          status: 409,
          error: 'A user with that email already exists'
        };
      }

      const validRole = await roleDao.getRoleById(role);

      if (!validRole) {
        fastify.log.error(`[User Service] :: Role ID ${role} does not exist.`);
        return {
          status: 404,
          error: 'User role does not exist'
        };
      }

      const user = {
        username,
        email,
        pwd: hashedPwd,
        role,
        address,
        privateKey,
        registrationStatus: 1
      };

      const savedUser = await userDao.createUser(user);

      if (!savedUser || savedUser == null) {
        fastify.log.error(
          '[User Service] :: There was an unexpected error creating the user:',
          user
        );
        return {
          status: 500,
          error: 'There was an unexpected error creating the user'
        };
      }

      return savedUser;
    } catch (error) {
      fastify.log.error('[User Service] :: Error creating User:', error);
      throw Error('Error creating User');
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
    return { error: 'User doesn\'t have a role' };
  },

  /**
   * Updates an existing user
   * @param {number} userId
   * @param {*} user
   * @returns updated user | error
   */
  async updateUser(userId, user) {
    fastify.log.info('[User Service] :: Updating User:', user);
    try {
      // check user existence
      const existingUser = await userDao.getUserById(userId);

      if (!existingUser) {
        fastify.log.error(`[User Service] :: User ID ${userId} does not exist`);
        return {
          status: 404,
          error: 'User does not exist'
        };
      }

      const { pwd, email, registrationStatus } = user;
      const newUser = { ...user };

      if (pwd) {
        const hashedPwd = await bcrypt.hash(pwd, 10);
        newUser.pwd = hashedPwd;
      }

      if (email) {
        const anotherUser = await userDao.getUserByEmail(email);

        if (anotherUser && anotherUser.id !== existingUser.id) {
          fastify.log.error(
            `[User Service] :: User with email ${email} already exists.`
          );
          return {
            status: 409,
            error: 'A user with that email already exists'
          };
        }
      }

      if (registrationStatus) {
        const existingStatus = await userRegistrationStatusDao.getUserRegistrationStatusById(
          registrationStatus
        );

        if (!existingStatus) {
          fastify.log.error(
            `[User Service] :: Registration Status ID ${registrationStatus} does not exist`
          );
          return {
            status: 404,
            error: 'Registration status is not valid'
          };
        }
      }

      const updatedUser = await userDao.updateUser(userId, newUser);

      if (!updatedUser) {
        fastify.log.error(
          '[User Service] :: User could not be updated',
          newUser
        );
        return {
          status: 500,
          error: 'User could not be updated'
        };
      }

      return updatedUser;
    } catch (error) {
      fastify.log.error('[User Service] :: Error updating User:', error);
      throw Error('Error updating User');
    }
  },

  /**
   * Gets all valid user registration status
   * @returns registration status list | error
   */
  async getAllRegistrationStatus() {
    fastify.log.info('[User Service] :: Getting all User Registration Status');
    try {
      const userRegistrationStatusList = await userRegistrationStatusDao.getAllRegistrationStatus();

      if (userRegistrationStatusList.length === 0) {
        fastify.log.info(
          '[User Service] :: No User Registration Status loaded'
        );
      }

      return userRegistrationStatusList;
    } catch (error) {
      fastify.log.error(
        '[User Service] :: Error getting all User Registration Status:',
        error
      );
      throw Error('Error getting all User Registration Status');
    }
  },

  /**
   * Gets all valid user roles
   * @returns role list | error
   */
  async getAllRoles() {
    fastify.log.info('[User Service] :: Getting all User Roles');
    try {
      const userRoleList = await roleDao.getAllRoles();

      if (userRoleList.length === 0) {
        fastify.log.info('[User Service] :: No User Roles loaded');
      }

      return userRoleList;
    } catch (error) {
      fastify.log.error(
        '[User Service] :: Error getting all User Roles:',
        error
      );
      throw Error('Error getting all User Roles');
    }
  },

  /**
   * Returns a list of oracles users
   */
  async getOracles() {
    return userDao.getOracles();
  }
});

module.exports = userService;
