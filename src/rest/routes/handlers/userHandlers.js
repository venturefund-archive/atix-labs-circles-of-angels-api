/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const config = require('config');
const apiHelper = require('../../services/helper');

const userService = require('../../services/userService');
const passRecoveryService = require('../../services/passRecoveryService');

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
    expirationDate.setMonth(
      expirationDate.getMonth() + config.jwt.expirationTime
    );

    reply
      .status(200)
      .setCookie('userAuth', token, {
        domain: config.server.domain,
        path: '/',
        httpOnly: true,
        expires: expirationDate,
        secure: config.server.isHttps
      })
      .send(user);
  },

  signupUser: () => async (request, reply) => {
    const user = await userService.createUser(request.body);
    reply.status(200).send({ userId: user.id });
  },

  recoverPassword: () => async (request, reply) => {
    const { email } = request.body || {};
    console.log('LlegoEmail::', email);
    const response = await passRecoveryService.startPassRecoveryProcess(email);
    reply.status(200).send(response);
  },

  updatePassword: fastify => async (request, reply) => {
    try {
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

  changePassword: () => async (request, reply) => {
    const { id } = request.user;
    const { encryptedWallet, password } = request.body || {};
    await userService.updatePassword(id, password, encryptedWallet);
    reply.status(200).send({ success: 'Password updated successfully' });
  },

  getWallet: () => async (request, reply) => {
    const { wallet } = request.user;
    const { encryptedWallet } = wallet;
    reply.status(200).send(encryptedWallet);
  },

  getWalletFromToken: () => async (request, reply) => {
    const { token } = request.params;
    const { wallet } = request.user;
    const encryptedWallet = await passRecoveryService.getWalletFromToken(token);
    reply.status(200).send(encryptedWallet);
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
  },

  getAppliedProjects: () => async (request, reply) => {
    const userId = request.user.id;
    const projects = await userService.getAppliedProjects({ userId });
    reply.status(200).send(projects);
  }
};
