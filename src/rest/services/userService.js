/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const bcrypt = require('bcrypt');
const { isEmpty } = require('lodash');
const {
  userRoles,
  blockchainStatus,
  projectStatus
} = require('../util/constants');
const {
  COAError,
  InvalidEmailError,
  QuestionnaireNotFoundError,
  UpdateUserError,
  UserAlreadyExistsError,
  UserNotFoundError,
  UserRejectedError,
  UserRoleDoesNotExistsError,
  UserStillNeedsApprovalError,
  UserWithoutRoleError
} = require('../errors/exporter/ErrorExporter');

// TODO : replace with a logger;
const logger = {
  log: () => {},
  error: (key, msg) => {
    console.error(key, msg);
  },
  info: () => {}
};

module.exports = {

  async getUserById(id) {
    return this.userDao.getUserById(id);
  },

  /**
   * Receives the user's email and password and tries to authenticate
   *
   * @param {string} email user's email
   * @param {string} pwd user's password
   * @returns user information | error message
   */
  async login(email, pwd) {
    const user = await this.userDao.getUserByEmail(email);

    if (user && user !== null) {
      // logger.info('[User Service] :: User found in database:', user);

      // if an user was found with that email, verify with encrypted pwd
      const match = await bcrypt.compare(pwd, user.pwd);

      if (match) {
        // logger.info('[User Service] :: User authenticated:', user.email);

        const authenticatedUser = {
          username: user.username,
          email: user.email,
          id: user.id,
          role: user.role
        };

        if (user.blocked) {
          logger.error(`[User Service] :: User ID ${user.id} is blocked`);

          throw new UserStillNeedsApprovalError(
            'User registration is still pending approval by the admin'
          );
        }

        if (user.registrationStatus === userRegistrationStatus.REJECTED) {
          logger.error(
            `[User Service] :: User ID ${
              user.id
            } registration status is Rejected`
          );

          throw new UserRejectedError(
            'User registration was rejected by the admin'
          );
        }

        return authenticatedUser;
      }

      // error if wrong password
      logger.error('[User Service] :: Password failed to authenticate');
    } else {
      // error if user not found
      logger.error('[User Service] :: User not found in database:', email);
    }

    return { error: 'Login failed. Incorrect user or password.' };
  },

  /**
   * Creates a new user
   *
   * @param {string} username
   * @param {string} email
   * @param {string} password
   * @param {number} role id
   * @param {object} detail additional user information
   * @param {object} questionnaire on boarding Q&A
   * @returns new user | error
   */
  async createUser({
    firstName,
    lastName,
    email,
    password,
    role,
    detail,
    questionnaire
  }) {
    const hashedPwd = await bcrypt.hash(password, 10);

    try {
      // FIXME unmock this
      const account = {
        address: '0x2131321',
        privateKey: '0x12313'
      };
      /*
      await fastify.eth.createAccount();
      if (!account.address || !account.privateKey) {
        fastify.log.error(
          '[User Service] :: Error creating account on blockchain'
        );
        return {
          status: 409,
          error: 'Error creating account on blockchain'
        };
      } */
    const existingUser = await this.userDao.getUserByEmail(email);

    if (existingUser) {
      logger.error(
        `[User Service] :: User with email ${email} already exists.`
      );
      throw new UserAlreadyExistsError('A user with that email already exists');
    }

    // TODO : address, privkey
    const user = {
      username,
      email: email.toLowerCase(),
      pwd: hashedPwd,
      role,
      address: '0x0', //account.address,
      registrationStatus: 1,
      transferBlockchainStatus: blockchainStatus.SENT,
      privKey: account.privateKey
    };

    const savedUser = await this.userDao.createUser(user);

    if (!savedUser || savedUser == null) {
      logger.error(
        '[User Service] :: There was an unexpected error creating the user:',
        user
      );
      throw new COAError('There was an unexpected error creating the user');
    }

    // sends welcome email
    await this.mailService.sendMail(
      '"Circles of Angels Support" <coa@support.com>',
      email,
      'Circles of Angels - Welcome!',
      `<p>Your Circles Of Angels account was created successfully! </br></p>
          <p>We are reviewing your account details. You will be notified once we are done. </br></p>
          <p>Thank you for your support. </br></p>`
    );

    return savedUser;
  },
  /**
   * Receives a User's id and returns their role
   *
   * @param {number} userId
   * @returns user's role | error message
   */
  async getUserRole(userId) {
    const user = await this.userDao.getUserById(userId);

    if (!user || user == null) {
      logger.error(`[User Service] :: User ID ${userId} not found in database`);
      throw new UserNotFoundError('User not found');
    }

    if (user.role && user.role != null) {
      logger.info(
        `[User Service] :: Found User ID ${user.id} with Role ${user.role.name}`
      );
      return user.role;
    }

    logger.error(`[User Service] :: User ID ${userId} doesn't have a role`);
    throw new UserWithoutRoleError("User doesn't have a role");
  },

  /**
   * Updates an existing user
   * @param {number} userId
   * @param {*} user
   * @returns updated user | error
   */
  async updateUser(userId, user) {
    logger.info('[User Service] :: Updating User:', user);
    // check user existence
    const existingUser = await this.userDao.getUserById(userId);

    if (!existingUser) {
      logger.error(`[User Service] :: User ID ${userId} does not exist`);
      throw new UserNotFoundError('User does not exist');
    }

      const { pwd, email } = user;
      const newUser = { ...user };

    if (pwd) {
      const hashedPwd = await bcrypt.hash(pwd, 10);
      newUser.pwd = hashedPwd;
    }

    if (email) {
      const anotherUser = await this.userDao.getUserByEmail(email);

      if (anotherUser && anotherUser.id !== existingUser.id) {
        logger.error(
          `[User Service] :: User with email ${email} already exists.`
        );
        throw new UserAlreadyExistsError(
          'A user with that email already exists'
        );
      }
    }

    let updatedUser = newUser;

    if (
      registrationStatus &&
      registrationStatus === userRegistrationStatus.APPROVED
    ) {
      const onConfirm = async () => {
        updatedUser = await this.userDao.updateUser(userId, newUser);
        const info = await this.mailService.sendMail(
          '"Circles of Angels Support" <coa@support.com>',
          updatedUser.email,
          'Circles of Angels - Account Confirmation',
          'Account Approved',
          `<p>Your Circles Of Angels account has been approved! </br></p>
              <p>You can log in and start using our 
              <a href='${frontendUrl}/login'>platform.</a></br></p>
              <p>Thank you for your support </br></p>`
        );
        if (!isEmpty(info.rejected)) {
          logger.error('[User Service] :: Invalid email');
          throw new InvalidEmailError('Invalid email');
        }
        await this.userDao.updateTransferBlockchainStatus(
          existingUser.id,
          blockchainStatus.CONFIRMED
        );

        return updatedUser;
      };
      // await fastify.eth.transferInitialFundsToAccount(
      //   existingUser.address,
      //   onConfirm
      // );
    }

    if (
      // FIXME, ESTO ESTA MAL HECHO
      registrationStatus &&
      registrationStatus === userRegistrationStatus.REJECTED
    ) {
      updatedUser = await this.userDao.updateUser(userId, newUser);
      const info = await this.mailService.sendMail(
        '"Circles of Angels Support" <coa@support.com>',
        updatedUser.email,
        'Circles of Angels - Account Rejected',
        'Account Rejected',
        `<p>We are sorry to inform you that your Circles Of Angels account has been rejected </br></p>
            <p>If you think there was an error, please contact us at:
            <a href="mailto:hello@circlesofangels.com">
              hello@circlesofangels.com
            </a></br></p>
            <p>Thank you for your support </br></p>`
      );

      if (!updatedUser) {
        logger.error('[User Service] :: User could not be updated', newUser);
        throw new UpdateUserError('User could not be updated');
      }

      if (!isEmpty(info.rejected)) {
        logger.error('[User Service] :: Invalid email');
        throw new InvalidEmailError('Invalid email');
      }
    }

    return updatedUser;
  },

  /**
   * Gets all valid user roles
   * @returns role list | error
   */
  getAllRoles() {
    logger.info('[User Service] :: Getting all User Roles');
    try {
      const userRoleWithoutAdmin = Object.assign({}, userRoles);
      delete userRoleWithoutAdmin.BO_ADMIN;

      if (userRoleWithoutAdmin.length === 0) {
        logger.info('[User Service] :: No User Roles loaded');
      }

      return userRoleWithoutAdmin;
    } catch (error) {
      logger.error('[User Service] :: Error getting all User Roles:', error);
      throw new COAError('Error getting all User Roles');
    }
  },

  /**
   * Returns a list of oracles users
   */
  async getOracles() {
    return this.userDao.getOracles();
  },

  /**
   * Returns a list of all non-admin users with their details
   *
   * @returns user list
   */
  async getUsers() {
    logger.info('[User Service] :: Getting all Users');
    try {
      // get users
      const users = await this.userDao.getUsers();
      return users;

      if (!userList || userList.length === 0) {
        fastify.log.info(
          '[User Service] :: There are currently no non-admin users in the database'
        );
        return [];
      }

      const allUsersWithDetail = await Promise.all(
        userList.map(async user => {
          // if se or funder get details
          if (this.roleCreationMap[user.role.id]) {
            // const detail = await this.roleCreationMap[user.role.id].getByUserId(
            //   user.id
            // );

            // add details to user
            const userWithDetail = {
              ...user
              // detail
            };

            return userWithDetail;
          }

          return user;
        })
      );

      // const allUsersWithDetail = await Promise.all(
      //   userList.map(async user => {
      //     // if se or funder get details
      //     if (this.roleCreationMap[user.role.id]) {
      //       // const detail = await this.roleCreationMap[user.role.id].getByUserId(
      //       //   user.id
      //       // );

      //       // add details to user
      //       const userWithDetail = {
      //         ...user
      //         // detail
      //       };

      //       return userWithDetail;
      //     }

      //     return user;
      //   })
      // );
      // return allUsersWithDetail;
    } catch (error) {
      logger.error('[User Service] :: Error getting all Users:', error);
      throw new COAError('Error getting all Users');
    }
  },

  // TODO FIXME: fix this.
  async getProjectsOfUser(userId, userProjectService, projectService) {
    return [];
    // try {
    //   const user = await this.getUserById(userId);
    //   let response = [];
    //   if (!user) {
    //     throw new UserNotFoundError('Nonexistent User');
    //   }
    //   switch (user.role.id) {
    //     case userRoles.IMPACT_FUNDER:
    //       response = (await userProjectService.getProjectsOfUser(
    //         userId
    //       )).filter(
    //         project =>
    //           project.status === projectStatus.PUBLISHED ||
    //           project.status === projectStatus.IN_PROGRESS
    //       );
    //       break;
    //     case userRoles.ORACLE:
    //       response = await projectService.getAllProjectsById(
    //         (await projectService.getProjectsAsOracle(userId)).projects
    //       );
    //       break;
    //     case userRoles.SOCIAL_ENTREPRENEUR:
    //       response = await projectService.getProjectsOfOwner(userId);
    //       break;
    //     default:
    //       throw new InvalidUserError('Invalid User');
    //   }
    //   return response;
    // } catch (error) {
    //   throw new COAUserServiceError('Error getting projects of user');
    // }
  },

  async validUser(user, roleId) {
    const existentUser = await this.userDao.getUserById(user.id);
    const role = roleId ? existentUser.role.id === roleId : true;
    return existentUser && !existentUser.blocked && role;
  }
};
