/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const crypto = require('crypto');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { isEmpty } = require('lodash');

const passRecoveryService = ({ fastify, passRecoveryDao, userDao }) => {
  const { support } = fastify.configs;
  const transporter = nodemailer.createTransport({
    service: support.service,
    auth: {
      user: support.email,
      pass: support.password
    }
  });

  return {
    async startPassRecoveryProcess(email) {
      fastify.log.info(
        '[Pass Recovery Service] :: Starting pass recovery for email:',
        email
      );
      try {
        const user = await userDao.getUserByEmail(email);
        if (!user) {
          return {
            status: 401,
            error: 'There is no user associated with that email'
          };
        }

        const hash = await crypto.randomBytes(25);
        const token = hash.toString('hex');

        const recovery = await passRecoveryDao.createRecovery(email, token);
        if (!recovery) return { status: 402, error: 'Cant create recovery' };
        const info = await transporter.sendMail({
          from: '"Circles of Angels Support" <coa@support.com>',
          to: email,
          subject: 'Circles of Angels - Recovery Password',
          text: 'Password recovery',
          html: `<p>Recovery password proccess started for your Circles Of Angels account </br></p>
          <p>Enter to the follow link to set a new password: </br></p>
          <a href='www.coa.com/passwordRecovery?token=${token}'>Recovery Link</a>`
        });

        if (!isEmpty(info.rejected))
          return { status: 403, error: 'Invalid Email' };

        return { email: info.accepted[0] };
      } catch (error) {
        fastify.log.error(
          '[Pass Recovery Service] :: Error staring recovery process:',
          error
        );
        throw Error('Error staring recovery process');
      }
    },

    async updatePassword(token, password) {
      try {
        const recover = await passRecoveryDao.findRecoverBytoken(token);

        if (!recover) {
          fastify.log.error(
            '[Pass Recovery Service] :: Token not found: ',
            token
          );
          return { status: 404, error: 'Invalid Token' };
        }

        const hoursFromCreation =
          (new Date() - new Date(recover.createdAt)) / 3600000;
        if (hoursFromCreation > support.recoveryTime) {
          fastify.log.error(
            '[Pass Recovery Service] :: Token has expired: ',
            token
          );
          await passRecoveryDao.deleteRecoverByToken(token);
          return { status: 409, error: 'Token has expired' };
        }

        if (!isEmpty(recover)) {
          const hashedPwd = await bcrypt.hash(password, 10);
          const updated = await userDao.updatePasswordByMail(
            recover.email,
            hashedPwd
          );
          if (!updated) {
            fastify.log.error(
              '[Pass Recovery Service] :: Error updating password in database for user: ',
              recover.email
            );
            return { status: 500, error: 'Error updating password' };
          }
          await passRecoveryDao.deleteRecoverByToken(token);
          return updated;
        }

        return { status: 404, error: 'Invalid token' };
      } catch (error) {
        fastify.log.error('[Pass Recovery Service] :: Error updating password');
        throw Error('Error updating password');
      }
    }
  };
};

module.exports = passRecoveryService;
