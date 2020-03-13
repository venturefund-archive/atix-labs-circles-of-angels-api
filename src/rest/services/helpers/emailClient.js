const config = require('config');
const nodemailer = require('nodemailer');

module.exports = {
  createEmailClient() {
    const { host, port, user, pass } = config.email;
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for other ports
      auth: {
        user,
        pass
      }
    });
  }
};
