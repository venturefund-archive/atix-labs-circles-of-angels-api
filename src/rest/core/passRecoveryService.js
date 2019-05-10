const crypto = require('crypto');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { isEmpty } = require('lodash');
const { support } = require('../../../config/configs');

const passRecoveryService = async ({ fastify, passRecoveryDao, userDao }) => {
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
      const recover = await passRecoveryDao.findRecoverBytoken(token);
      const hoursFromCreation =
        (new Date() - new Date(recover.createdAt)) / 3600000;
      if (hoursFromCreation > support.recoveryTime) {
        await passRecoveryDao.deleteRecoverByToken(token);
        return { status: 403, error: 'Expired token' };
      }

      if (!isEmpty(recover)) {
        const hashedPwd = await bcrypt.hash(password, 10);
        const updated = await userDao.updatePasswordByMail(
          recover.email,
          hashedPwd
        );
        if (!updated)
          return { status: 402, error: 'Error trying update password' };
        await passRecoveryDao.deleteRecoverByToken(token);
        return { message: 'Password update successfully' };
      }
      return { status: 401, error: 'Invalid token' };
    }
  };
};

module.exports = passRecoveryService;
