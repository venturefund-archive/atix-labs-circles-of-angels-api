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
const COAError = require('../errors/COAError');
const errors = require('../errors/exporter/ErrorExporter');
const logger = require('../logger');

module.exports = {
  async startPassRecoveryProcess(email) {
    logger.info(
      '[Pass Recovery Service] :: Starting pass recovery for email:',
      email
    );
    const user = await this.userDao.getUserByEmail(email);
    if (!user) {
      logger.info(
        '[PassRecovery Service] :: There is no user associated with that email',
        email
      );
      return email;
    }

    const hash = await crypto.randomBytes(25);
    const token = hash.toString('hex');
    const recovery = await this.passRecoveryDao.createRecovery(email, token);

    if (!recovery) {
      logger.info(
        '[PassRecovery Service]:: Can not create recovery with email',
        email
      );
      return email;
    }

    const info = await this.mailService.sendEmailRecoveryPassword({
      to: email,
      bodyContent: {
        token
      }
    });

    if (!info || !isEmpty(info.rejected)) {
      logger.info('[PassRecovery Service] :: Invalid email', email);
    }

    return email;
  },

  async getMnemonicFromToken(token) {
    const recover = await this.passRecoveryDao.findRecoverBytoken(token);
    if (!recover) {
      logger.error('[Pass Recovery Service] :: Token not found: ', token);
      throw new COAError(errors.user.InvalidToken);
    }

    const hoursFromCreation =
      (new Date() - new Date(recover.createdAt)) / 3600000;
    if (hoursFromCreation > support.recoveryTime) {
      logger.error('[Pass Recovery Service] :: Token has expired: ', token);
      await this.passRecoveryDao.deleteRecoverByToken(token);
      throw new COAError(errors.user.ExpiredToken);
    }

    const { email } = recover;
    const { mnemonic } = await this.userDao.getUserByEmail(email);
    if (!mnemonic) {
      logger.error(
        '[Pass Recovery Service] :: Mnemonic not found of user with email: ',
        email
      );
      throw new COAError(errors.user.InvalidEmail);
    }
    return mnemonic;
  },

  async updatePassword(token, password, encryptedWallet) {
    try {
      const { email } = await this.passRecoveryDao.findRecoverBytoken(token);
      if (!email) {
        logger.error('[Pass Recovery Service] :: Token not found: ', token);
        throw new COAError(errors.user.InvalidToken);
      }
      let user = await this.userDao.getUserByEmail(email);
      if (!user) {
        logger.error(
          '[UserService] :: There is no user associated with that email',
          id
        );
        throw new COAError(errors.user.InvalidEmail);
      }
      const hashedPwd = await bcrypt.hash(password, 10);
      user = {
        password: hashedPwd,
        encryptedWallet,
        address: user.address,
        mnemonic: user.mnemonic,
        forcePasswordChange: false
      };
      const updated = await this.userDao.updateUserByEmail(email, user);
      if (!updated) {
        logger.error(
          '[Pass Recovery Service] :: Error updating password in database for user: ',
          email
        );
        throw new COAError(errors.user.UserUpdateError);
      }
      await this.passRecoveryDao.deleteRecoverByToken(token);
      return updated;
    } catch (error) {
      logger.error('[Pass Recovery Service] :: Error updating password');
      throw Error('Error updating password');
    }
  }
};
