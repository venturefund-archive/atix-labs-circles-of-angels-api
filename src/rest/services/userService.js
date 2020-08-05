/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const { coa, ethers } = require('@nomiclabs/buidler');
const bcrypt = require('bcrypt');
const { Wallet, utils } = require('ethers');

const { userRoles } = require('../util/constants');
const validateRequiredParams = require('./helpers/validateRequiredParams');
const checkExistence = require('./helpers/checkExistence');

const logger = require('../logger');
const COAError = require('../errors/COAError');
const errors = require('../errors/exporter/ErrorExporter');

module.exports = {
  async getUserById(id) {
    logger.info('[UserService] :: Entering getUserById method');
    const user = await checkExistence(this.userDao, id, 'user');
    logger.info(`[UserService] :: User id ${user.id} found`);
    return user;
  },

  /**
   * Returns the user which the specified address belongs to
   * @param {String} address
   */
  async getUserByAddress(address) {
    logger.info('[UserService] :: Entering getUserByAddress method');
    const user = await this.userDao.findByAddress(address);
    if (user) {
      logger.info('[UserService] :: User found');
      return user;
    }
    logger.error(`[UserService] :: User with address ${address} not found`);
    throw new COAError(errors.common.CantFindModelWithAddress('user', address));
  },

  /**
   * Receives the user's email and password and tries to authenticate
   *
   * @param {string} email user's email
   * @param {string} pwd user's password
   * @returns user information | error message
   */
  async login(email, pwd) {
    logger.info(`[User Service] :: Trying to login ${email} user`);
    const user = await this.userDao.getUserByEmail(email);

    if (!user) {
      logger.error('[User Service] :: User was not found');
      throw new COAError(errors.user.InvalidUserOrPassword);
    }

    logger.info(`[User Service] :: User email ${email} found`);
    const match = await bcrypt.compare(pwd, user.password);

    if (!match) {
      logger.error(
        '[User Service] :: Login failed. Incorrect user or password'
      );
      throw new COAError(errors.user.InvalidUserOrPassword);
    }
    logger.info('[User Service] :: User has matched user and password');
    const { firstName, lastName, id, role, forcePasswordChange } = user;

    logger.info('[User Service] :: Trying to see if user belongs to a Dao');
    user.wallet = await this.getUserWallet(user.id);
    const userDaos = await this.daoService.getDaos({ user });
    const hasDaos = userDaos.length > 0;
    logger.info(`[User Service] :: User belongs to any DAO? ${hasDaos}`);

    const authenticatedUser = {
      firstName,
      lastName,
      email: user.email,
      id,
      role,
      hasDaos,
      forcePasswordChange
    };

    logger.info(
      `[User Service] :: User ID ${
        user.id
      } should be forced to change its password`
    );

    if (user.blocked) {
      logger.error(`[User Service] :: User ID ${user.id} is blocked`);
      throw new COAError(errors.user.UserRejected);
    }

    return authenticatedUser;
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
    phoneNumber,
    country,
    company,
    answers,
    address,
    encryptedWallet
  }) {
    logger.info(`[User Routes] :: Creating new user with email ${email}`);
    validateRequiredParams({
      method: 'createUser',
      params: {
        firstName,
        lastName,
        email,
        password,
        role,
        phoneNumber,
        country,
        answers,
        address,
        encryptedWallet
      }
    });

    const existingUser = await this.userDao.getUserByEmail(email);

    if (existingUser) {
      logger.error(
        `[User Service] :: User with email ${email} already exists.`
      );
      throw new COAError(errors.user.EmailAlreadyInUse);
    }
    await this.countryService.getCountryById(country);

    // TODO: check phoneNumber format

    const hashedPwd = await bcrypt.hash(password, 10);

    const user = {
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPwd,
      role,
      phoneNumber,
      country,
      answers,
      company,
      address,
      encryptedWallet
    };
    // TODO: this should be replaced by a gas relayer
    const accounts = await ethers.signers();
    const tx = {
      to: address,
      value: utils.parseEther('0.001')
    };
    await accounts[0].sendTransaction(tx);

    const profile = `${firstName} ${lastName}`;
    // using migrateMember instead of createMember for now
    await coa.migrateMember(profile, address);

    const savedUser = await this.userDao.createUser(user);
    logger.info(`[User Service] :: New user created with id ${savedUser.id}`);

    await this.mailService.sendSignUpMail({
      to: email,
      bodyContent: {
        userName: firstName
      }
    });

    return savedUser;
  },

  /**
   * Returns a list of all non-admin users with their details
   *
   * @returns user list
   */
  async getUsers() {
    logger.info('[User Service] :: Getting all Users');
    return this.userDao.getUsers();
  },

  /**
   * Returns an array of projects associated with the specified user.
   *
   * @param {number} userId
   * @returns {Promise<Project[]>} array of found projects
   */
  async getProjectsOfUser(userId) {
    logger.info('[UserService] :: Entering getProjectsOfUser method');
    validateRequiredParams({
      method: 'getProjectsOfUser',
      params: { userId }
    });
    const user = await checkExistence(this.userDao, userId, 'user');
    if (user.role === userRoles.ENTREPRENEUR) {
      const projects = await this.projectService.getProjectsByOwner(userId);
      return projects;
    }

    if (user.role === userRoles.PROJECT_SUPPORTER) {
      // TODO: Do this when the relation between supporter and project exists
      const projects = [];
      return projects;
    }

    return [];
  },

  /**
   * Returns an array of followed projects for an specific user.
   *
   * @param {number} userId
   * @returns {Promise<Project[]>} array of found projects
   */
  async getFollowedProjects({ userId }) {
    logger.info('[UserService] :: Entering getFollowedProjects method');
    validateRequiredParams({
      method: 'getFollowedProjects',
      params: { userId }
    });

    const user = await this.userDao.getFollowedProjects(userId);

    if (!user) {
      logger.error(`[User Service] :: User ID ${userId} does not exist`);
      throw new COAError(errors.user.UserNotFound);
    }

    const { following } = user;
    return following || [];
  },

  /**
   * Returns an array of projects where the user applied as candidate
   *
   * @param {number} userId
   * @returns {Promise<Project[]>} array of found projects
   */
  async getAppliedProjects({ userId }) {
    logger.info('[UserService] :: Entering getAppliedProjects method');
    validateRequiredParams({
      method: 'getAppliedProjects',
      params: { userId }
    });

    const user = await this.userDao.getAppliedProjects(userId);

    if (!user) {
      logger.error(`[User Service] :: User ID ${userId} does not exist`);
      throw new COAError(errors.user.UserNotFound);
    }

    return {
      funding: user.funding,
      monitoring: user.monitoring
    };
  },

  async validUser(user, roleId) {
    const existentUser = await this.getUserById(user.id);
    const role = roleId ? existentUser.role === roleId : true;
    return existentUser && !existentUser.blocked && role;
  },

  async getUserWallet(userId) {
    logger.info('[UserService] :: Entering getUserWallet method');
    const user = await this.getUserById(userId);
    const { encryptedWallet, address } = user;
    // const wallet = new Wallet(privKey, ethers.provider);
    return { address, encryptedWallet };
  }
};
