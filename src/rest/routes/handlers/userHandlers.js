/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const basePath = '/user';
const apiHelper = require('../../services/helper');

const userService = require('../../services/userService');

module.exports = {
  getUser: fastify => async (request, reply) => {
    fastify.log.info('[User Routes] :: Getting user info');
    const user = await userService.getUserById(request.params.userId);
    if (!user)
      reply.status(404).send({
        error: `Cannot find user with id: ${request.params.userId}`
      });

    reply.send(user);
  },

  getUsers: () => async (request, reply) => {
    const users = await userService.getUsers();
    reply.status(200).send({ users });
  },

  getUserRole: fastify => async (request, reply) => {
    try {
      fastify.log.info('[User Routes] :: Getting user role');
      const role = await userService.getUserRole(request.params.userId);

      if (!role.error) {
        fastify.log.info('[User Routes] :: Role found: ', role);
        reply.status(200).send(role);
      } else {
        fastify.log.info(
          '[User Routes] :: Error getting user role: ',
          role.error
        );
        reply.status(404).send(role);
      }
    } catch (error) {
      fastify.log.error(
        '[User Routes] :: There was an error getting the user´s role:',
        error
      );
      reply.status(500).send({
        error: 'There was an unexpected error getting the user´s role'
      });
    }
  },

  getAllRoles: () => (request, reply) => {
    const roles = userService.getAllRoles();
    reply.status(200).send(roles);
  },

  loginUser: fastify => async (request, reply) => {
    const { email, pwd } = request.body;
    const user = await userService.login(email, pwd);

    const token = fastify.jwt.sign(user);
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 1);

    reply
      .status(200)
      .setCookie('userAuth', token, {
        domain: fastify.configs.server.host,
        path: '/',
        httpOnly: true,
        expires: expirationDate
        // secure: true
      })
      .send(user);
  },

  signupUser: () => async (request, reply) => {
    const user = await userService.createUser(request.body);
    reply.status(200).send({ userId: user.id });
  },

  updateUser: fastify => async (request, reply) => {
    const { userId } = request.params;
    fastify.log.info(`PUT request at ${basePath}/${userId}`, request.body);
    try {
      const { body } = request;

      const updatedUser = await userService.updateUser(userId, body);

      if (updatedUser.error) {
        fastify.log.error('[User Routes] :: User update failed', updatedUser);
        reply.status(updatedUser.status).send(updatedUser);
      } else {
        fastify.log.info('[User Routes] :: Update successful:', updatedUser);
        reply.status(200).send({ success: 'User successfully updated!' });
      }
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: 'Error updating user' });
    }
  },

  getOracles: fastify => async (request, reply) => {
    fastify.log.info('[User Routes] :: getting list of oracles');
    try {
      const oracles = await userService.getOracles();
      reply.status(200).send(oracles);
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: 'Error getting oracles' });
    }
  },

  recoverPassword: fastify => async (request, reply) => {
    try {
      const { passRecoveryService } = apiHelper.helper.services;
      fastify.log.info('[User Routes] :: Starting pass recovery proccess');
      const { email } = request.body;
      const response = await passRecoveryService.startPassRecoveryProcess(
        email
      );
      if (response.error) {
        fastify.log.error(
          '[User Routes] :: Recovery password procces failed',
          response
        );
        reply.status(response.status).send(response);
      } else {
        fastify.log.info(
          '[User Routes] :: Recovery password procces started successfully',
          response
        );
        reply.status(200).send(response);
      }
    } catch (error) {
      fastify.log.error(error);
      reply
        .status(500)
        .send({ error: 'Error Starting recovery password proccess' });
    }
  },

  updatePassword: fastify => async (request, reply) => {
    try {
      const { passRecoveryService } = apiHelper.helper.services;
      fastify.log.info('[User Routes] :: Updating password');
      const { token, password } = request.body;
      const response = await passRecoveryService.updatePassword(
        token,
        password
      );
      if (response.error) {
        fastify.log.error('[User Routes] :: Update password failed', response);
        reply.status(response.status).send(response);
      } else {
        fastify.log.info(
          '[User Routes] :: Password updated successfully',
          response
        );
        reply.status(200).send({ success: 'Password updated successfully' });
      }
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: 'Error updating password' });
    }
  },

  getMyProjects: () => async (request, reply) => {
    const userId = request.user.id;
    const projects = await userService.getProjectsOfUser(userId);
    reply.status(200).send(projects);
  },

  getFollowedProjects: () => async (request, reply) => {
    const userId = request.user.id;
    const projects = await userService.getFollowedProjects({ userId });
    reply.status(200).send(projects);
  }
};
