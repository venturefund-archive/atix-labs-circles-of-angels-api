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
const { link } = require('fs');
const { encrypt } = require('ethers/utils/secret-storage');
const COAError = require('../errors/COAError');
const errors = require('../errors/exporter/ErrorExporter');
const logger = require('../logger');

module.exports = {
  async startPassRecoveryProcess(email) {
    logger.info(
      '[Pass Recovery Service] :: Starting pass recovery for email:',
      email
    );
    try {
      const user = await this.userDao.getUserByEmail(email);
      if (!user) {
        logger.info(
          '[PassRecovery Service] :: There is no user associated with that email',
          email
        );
        throw new COAError(errors.user.InvalidEmail);
      }

      const hash = await crypto.randomBytes(25);
      const token = hash.toString('hex');
      // console.log('token', token);
      const recovery = await this.passRecoveryDao.createRecovery(email, token);
      // console.log('recovery', recovery);

      if (!recovery) {
        logger.info(
          '[PassRecovery Service]:: Can not create recovery with email',
          email
        );
        throw new COAError(errors.user.InvalidRecovery());
      }

      // const info = await this.mailService.sendMail({
      //   from: '"Circles of Angels Support" <coa@support.com>',
      //   to: email,
      //   subject: 'Circles of Angels - Recovery Password',
      //   text: 'Password recovery',
      //   html: `<p>Recovery password proccess started for your Circles Of Angels account </br></p>
      //     <p>Enter to the follow link to set a new password: </br></p>
      //     <a href='${frontendUrl}/forgot-password?token=${token}'>Recovery Link</a>`
      // });

      // console.log(`${frontendUrl}/forgot-password?token=${token}`, 'link');

      // if (!isEmpty(info.rejected)) {
      //   logger.info('[PassRecovery Service] :: Invalid email', email);
      //   return { status: 403, error: 'Invalid Email' };
      // }

      // return { email: info.accepted[0] };
      return email;
    } catch (error) {
      logger.error(
        '[Pass Recovery Service] :: Error starting recovery process:',
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
  },

  async getWalletFromToken(token) {
    try {
      const recover = await this.passRecoveryDao.findRecoverBytoken(token);
      if (!recover) {
        logger.error('[Pass Recovery Service] :: Token not found: ', token);
        throw new COAError(errors.user.InvalidToken);
      }

      // const hoursFromCreation =
      //   (new Date() - new Date(recover.createdAt)) / 3600000;
      // if (hoursFromCreation > support.recoveryTime) {
      //   logger.error('[Pass Recovery Service] :: Token has expired: ', token);
      //   await this.passRecoveryDao.deleteRecoverByToken(token);
      //   throw new COAError(errors.user.InvalidToken);
      // }

      const { email } = recover;
      const { encryptedWallet } = await this.userDao.getUserByEmail(email);
      if (!encryptedWallet) {
        logger.error(
          '[Pass Recovery Service] :: Wallet not found of user with email: ',
          email
        );
        throw new COAError(errors.user.InvalidEmail);
      }
      // console.log(encryptedWallet);
      return encryptedWallet;
    } catch (error) {
      logger.error(
        '[Pass Recovery Service] :: Error validating token in recovery process:',
        error
      );
      throw Error('Error validating token in recovery process');
    }
  }
};
