/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

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

  loginUser: fastify => async (request, reply) => {
    const { email, pwd } = request.body;
    const user = await userService.login(email, pwd);

    const token = fastify.jwt.sign(user);
    const expirationDate = new Date();
    expirationDate.setMonth(expirationDate.getMonth() + 3);

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
