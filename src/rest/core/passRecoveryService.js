const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { isEmpty } = require('lodash');
const { supportAccount } = require('../../../config/configs');

const passRecoveryService = async ({ fastify, passRecoveryDao, userDao }) => {
  const transporter = nodemailer.createTransport({
    service: supportAccount.service,
    auth: {
      user: supportAccount.email,
      pass: supportAccount.password
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
    }
  };
};

module.exports = passRecoveryService;
