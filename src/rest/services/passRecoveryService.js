/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { isEmpty, update } = require('lodash');
const { support } = require('config');
const config = require('config');

const { key } = config.crypto;

const COAError = require('../errors/COAError');
const errors = require('../errors/exporter/ErrorExporter');
const logger = require('../logger');
const { encrypt, decrypt } = require('../util/crypto');

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
    const { mnemonic, iv } = await this.userDao.getUserByEmail(email);
    // TODO: uncomment this validation when it's already migrated all users
    /* if (!mnemonic) {
      logger.error(
        '[Pass Recovery Service] :: Mnemonic not found of user with email: ',
        email
      );
      throw new COAError(errors.user.InvalidEmail);
    } */
    // TODO: remove this validation when it's already migrated all users
    if (!iv) {
      return mnemonic;
    }
    const decryptedMnemonic = decrypt(mnemonic, key, iv);
    if (!decryptedMnemonic) {
      logger.error(
        '[Pass Recovery Service] :: Mnemonic could not be decrypted',
        mnemonic,
        iv
      );
      throw new COAError(errors.user.MnemonicNotDecrypted);
    }
    return decryptedMnemonic;
  },

  async updatePassword(
    user,
    password,
    newAddress,
    newEncryptedWallet,
    newMnemonic
  ) {
    try {
      const { id, address, email, encryptedWallet } = user;
      // Only for old users with no mnemonic
      // TODO: remove this validation when it's already migrated all users
      if (address && address !== newAddress) {
        await this.userWalletDao.createUserWallet(
          {
            user: id,
            encryptedWallet,
            address
          },
          false
        );
      }
      const hashedPwd = await bcrypt.hash(password, 10);
      const updated = await this.userDao.updateUserByEmail(email, {
        password: hashedPwd,
        forcePasswordChange: false
      });
      const disabledWallet = await this.userWalletDao.updateWallet(
        { user: id, active: true },
        { active: false }
      );
      const newEncryptedMnemonic = await encrypt(newMnemonic, key);
      if (
        !newEncryptedMnemonic ||
        !newEncryptedMnemonic.encryptedData ||
        !newEncryptedMnemonic.iv
      ) {
        logger.error('[User Service] :: Mnemonic could not be encrypted');
        throw new COAError(errors.user.MnemonicNotEncrypted);
      }
      const savedUserWallet = await this.userWalletDao.createUserWallet(
        {
          user: id,
          encryptedWallet: newEncryptedWallet,
          address: newAddress,
          mnemonic: newEncryptedMnemonic.encryptedData,
          iv: newEncryptedMnemonic.iv
        },
        true
      );
      if (!savedUserWallet) {
        if (disabledWallet) {
          // Rollback
          await this.userWalletDao.updateWallet(
            { id: disabledWallet.id },
            { active: true }
          );
        }
        throw new COAError(errors.userWallet.NewWalletNotSaved);
      }
      if (!updated) {
        logger.error(
          '[Pass Recovery Service] :: Error updating password in database for user: ',
          email
        );
        throw new COAError(errors.user.UserUpdateError);
      }
      return updated;
    } catch (error) {
      logger.error('[Pass Recovery Service] :: Error updating password', error);
      throw Error('Error updating password');
    }
  },

  async updatePasswordByToken(
    token,
    password,
    address,
    encryptedWallet,
    mnemonic
  ) {
    const { email } = await this.passRecoveryDao.findRecoverBytoken(token);
    if (!email) {
      logger.error('[Pass Recovery Service] :: Token not found: ', token);
      throw new COAError(errors.user.InvalidToken);
    }
    const user = await this.userDao.getUserByEmail(email);
    if (!user) {
      logger.error(
        '[UserService] :: There is no user associated with that email',
        email
      );
      throw new COAError(errors.user.InvalidEmail);
    }
    try {
      const updated = await this.updatePassword(
        user,
        password,
        address,
        encryptedWallet,
        mnemonic
      );
      await this.passRecoveryDao.deleteRecoverByToken(token);
      return updated;
    } catch (error) {
      throw Error(error);
    }
  },

  async updatePasswordById(
    id,
    currentPassword,
    newPassword,
    address,
    encryptedWallet,
    mnemonic
  ) {
    const user = await this.userDao.findById(id);
    if (!user) {
      logger.error(
        '[UserService] :: There is no user associated with that email',
        email
      );
      throw new COAError(errors.user.InvalidEmail);
    }

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      logger.error(
        '[User Service] :: Update password failed. Current password is incorrect'
      );
      throw new COAError(errors.user.InvalidPassword);
    }
    return this.updatePassword(
      user,
      newPassword,
      address,
      encryptedWallet,
      mnemonic
    );
  }
};
