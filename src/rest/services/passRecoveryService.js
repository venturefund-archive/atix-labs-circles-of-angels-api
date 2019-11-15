/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { isEmpty } = require('lodash');
const { frontendUrl, support } = require('config');

// TODO : replace with a logger;
const logger = {
  log: () => {},
  error: () => {},
  info: () => {}
};

module.exports = {
  async startPassRecoveryProcess(email) {
    logger.info(
      '[Pass Recovery Service] :: Starting pass recovery for email:',
      email
    );
    try {
      const user = await this.userDao.getUserByEmail(email);
      if (!user) {
        return {
          status: 401,
          error: 'There is no user associated with that email'
        };
      }

      const hash = await crypto.randomBytes(25);
      const token = hash.toString('hex');

      const recovery = await this.passRecoveryDao.createRecovery(email, token);

      if (!recovery) return { status: 402, error: 'Cant create recovery' };

      const info = await this.mailService.sendMail({
        from: '"Circles of Angels Support" <coa@support.com>',
        to: email,
        subject: 'Circles of Angels - Recovery Password',
        text: 'Password recovery',
        html: `<p>Recovery password proccess started for your Circles Of Angels account </br></p>
          <p>Enter to the follow link to set a new password: </br></p>
          <a href='${frontendUrl}/passwordRecovery?token=${token}'>Recovery Link</a>`
      });

      if (!isEmpty(info.rejected))
        return { status: 403, error: 'Invalid Email' };

      return { email: info.accepted[0] };
    } catch (error) {
      logger.error(
        '[Pass Recovery Service] :: Error staring recovery process:',
        error
      );
      throw Error('Error staring recovery process');
    }
  },

  async updatePassword(token, password) {
    try {
      const recover = await this.passRecoveryDao.findRecoverBytoken(token);

      if (!recover) {
        logger.error('[Pass Recovery Service] :: Token not found: ', token);
        return { status: 404, error: 'Invalid Token' };
      }

      const hoursFromCreation =
        (new Date() - new Date(recover.createdAt)) / 3600000;
      if (hoursFromCreation > support.recoveryTime) {
        logger.error('[Pass Recovery Service] :: Token has expired: ', token);
        await this.passRecoveryDao.deleteRecoverByToken(token);
        return { status: 409, error: 'Token has expired' };
      }

      if (!isEmpty(recover)) {
        const hashedPwd = await bcrypt.hash(password, 10);
        const updated = await this.userDao.updatePasswordByMail(
          recover.email,
          hashedPwd
        );
        if (!updated) {
          logger.error(
            '[Pass Recovery Service] :: Error updating password in database for user: ',
            recover.email
          );
          return { status: 500, error: 'Error updating password' };
        }
        await this.passRecoveryDao.deleteRecoverByToken(token);
        return updated;
      }

      return { status: 404, error: 'Invalid token' };
    } catch (error) {
      logger.error('[Pass Recovery Service] :: Error updating password');
      throw Error('Error updating password');
    }
  }
};