/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { isEmpty } = require('lodash');
const {
  userRegistrationStatus,
  userRoles,
  blockchainStatus
} = require('../util/constants');

const userService = ({
  fastify,
  userDao,
  userFunderDao,
  userSocialEntrepreneurDao,
  userRegistrationStatusDao,
  roleDao,
  questionnaireService
}) => {
  const { support } = fastify.configs;
  const transporter = nodemailer.createTransport({
    service: support.service,
    auth: {
      user: support.email,
      pass: support.password
    }
  });

  return {
    roleCreationMap: {
      [userRoles.IMPACT_FUNDER]: userFunderDao,
      [userRoles.SOCIAL_ENTREPRENEUR]: userSocialEntrepreneurDao
    },

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
        fastify.log.error(
          '[User Service] :: User not found in database:',
          email
        );
      }

      return { error: 'Login failed. Incorrect user or password.' };
    },

    /**
     * Creates a new user
     *
     * @param {string} username
     * @param {string} email
     * @param {string} pwd
     * @param {number} role id
     * @param {object} detail additional user information
     * @param {object} questionnaire on boarding Q&A
     * @returns new user | error
     */
    async createUser(username, email, pwd, role, detail, questionnaire) {
      const hashedPwd = await bcrypt.hash(pwd, 10);

      try {
        const account = await fastify.eth.createAccount();
        if (!account.address || !account.privateKey) {
          fastify.log.error(
            '[User Service] :: Error creating account on blockchain'
          );
          return {
            status: 409,
            error: 'Error creating account on blockchain'
          };
        }
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
          fastify.log.error(
            `[User Service] :: Role ID ${role} does not exist.`
          );
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
          address: account.address,
          registrationStatus: 1,
          transferBlockchainStatus: blockchainStatus.SENT,
          privKey: account.privateKey
        };

        const savedUser = await userDao.createUser(user);
        if (this.roleCreationMap[role]) {
          const savedInfo = await this.roleCreationMap[role].create({
            user: savedUser.id,
            ...detail
          });
          fastify.log.info('[User Service] :: User Info saved', savedInfo);
        }

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

        if (questionnaire)
          await questionnaireService.saveQuestionnaireOfUser(
            savedUser.id,
            questionnaire
          );
        // sends welcome email
        const info = await transporter.sendMail({
          from: '"Circles of Angels Support" <coa@support.com>',
          to: email,
          subject: 'Circles of Angels - Welcome!',
          text: 'Hello!',
          html: `<p>Your Circles Of Angels account was created successfully! </br></p>
          <p>We are reviewing your account details. You will be notified once we are done. </br></p>
          <p>Thank you for your support. </br></p>`
        });
        if (!isEmpty(info.rejected)) {
          fastify.log.info(
            '[User Service] :: Invalid email account',
            info.rejected
          );
          return { status: 409, error: 'Invalid Email' };
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
          `[User Service] :: Found User ID ${user.id} with Role ${
            user.role.name
          }`
        );
        return user.role;
      }

      fastify.log.error(
        `[User Service] :: User ID ${userId} doesn't have a role`
      );
      return { error: "User doesn't have a role" };
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
          fastify.log.error(
            `[User Service] :: User ID ${userId} does not exist`
          );
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

        let updatedUser = newUser;

        if (
          registrationStatus &&
          registrationStatus === userRegistrationStatus.APPROVED
        ) {
          const onConfirm = async () => {
            const info = await transporter.sendMail({
              from: '"Circles of Angels Support" <coa@support.com>',
              to: updatedUser.email,
              subject: 'Circles of Angels - Account Confirmation',
              text: 'Account Approved',
              html: `<p>Your Circles Of Angels account has been approved! </br></p>
              <p>You can log in and start using our platform at: 
              <a href='www.coa.com/login'>www.coa.com/login</a></br></p>
              <p>Thank you for your support </br></p>`
            });
            if (!isEmpty(info.rejected))
              return { status: 409, error: 'Invalid Email' };
            await userDao.updateTransferBlockchainStatus(
              existingUser.id,
              blockchainStatus.CONFIRMED
            );
            updatedUser = await userDao.updateUser(userId, newUser);
          };
          await fastify.eth.transferInitialFundsToAccount(
            existingUser.address,
            onConfirm
          );
        }

        if (
          registrationStatus &&
          registrationStatus === userRegistrationStatus.REJECTED
        ) {
          const info = await transporter.sendMail({
            from: '"Circles of Angels Support" <coa@support.com>',
            to: updatedUser.email,
            subject: 'Circles of Angels - Account Rejected',
            text: 'Account Rejected',
            html: `<p>We are sorry to inform you that your Circles Of Angels account has been rejected </br></p>
            <p>If you think there was an error, please contact us at:
            <a href="mailto:hello@circlesofangels.com">
              hello@circlesofangels.com
            </a></br></p>
            <p>Thank you for your support </br></p>`
          });

          updatedUser = await userDao.updateUser(userId, newUser);

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

          if (!isEmpty(info.rejected))
            return { status: 409, error: 'Invalid Email' };
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
      fastify.log.info(
        '[User Service] :: Getting all User Registration Status'
      );
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

        const userRoleWithoutAdmin = await userRoleList.filter(
          userRole => userRole.id !== userRoles.BO_ADMIN
        );

        if (userRoleWithoutAdmin.length === 0) {
          fastify.log.info('[User Service] :: No User Roles loaded');
        }

        return userRoleWithoutAdmin;
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
    },

    /**
     * Returns a list of all non-admin users with their details
     *
     * @returns user list
     */
    async getUsers() {
      fastify.log.info('[User Service] :: Getting all Users');
      try {
        // get users
        const userList = await userDao.getUsers();
        userList.forEach(async user => {
          try {
            const answers = await questionnaireService.getAnswersOfUser(user);
            user.answers = answers;
          } catch (error) {
            fastify.log.error('Questionnaire not found for user:', user.id);
          }
        });

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
              const detail = await this.roleCreationMap[
                user.role.id
              ].getByUserId(user.id);

              // add details to user
              const userWithDetail = {
                ...user,
                detail
              };

              return userWithDetail;
            }

            return user;
          })
        );

        return allUsersWithDetail;
      } catch (error) {
        fastify.log.error('[User Service] :: Error getting all Users:', error);
        throw Error('Error getting all Users');
      }
    },

    async getProjectsOfUser(userId, userProjectService, projectService) {
      try {
        const user = await this.getUserById(userId);
        let response = [];
        if (!user) {
          return { status: 404, error: 'Nonexistent User' };
        }
        switch (user.role.id) {
          case userRoles.IMPACT_FUNDER:
            response = await userProjectService.getProjectsOfUser(userId);
            break;
          case userRoles.ORACLE:
            response = await projectService.getAllProjectsById(
              (await projectService.getProjectsAsOracle(userId)).projects
            );
            break;
          case userRoles.SOCIAL_ENTREPRENEUR:
            response = await projectService.getProjectsOfOwner(userId);
            break;
          default:
            return { status: 409, error: 'Invalid User' };
        }
        return response;
      } catch (error) {
        return { status: 500, error: 'Error getting projects of user' };
      }
    },

    async validUser(user, roleId) {
      const existentUser = await userDao.getUserById(user.id);
      const role = roleId ? existentUser.role.id === roleId : true;
      return (
        existentUser &&
        existentUser.registrationStatus === userRegistrationStatus.APPROVED &&
        role
      );
    }
  };
};

module.exports = userService;
