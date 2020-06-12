const config = require('config');
const nodemailer = require('nodemailer');
const sendgrid = require('@sendgrid/mail');

const logger = require('../../logger');

let emailClient;
const { host, port, user, pass, apiKey } = config.email;
if (apiKey) {
  sendgrid.setApiKey(apiKey);
  emailClient = sendgrid;
} else {
  emailClient = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user,
      pass
    }
  });
}

module.exports = {
  sendMail(args) {
    if (config.email.disabled) {
      logger.warn('[EmailClient] :: Email client is disabled');
      return {};
    }
    // nodemailer uses sendMail(), sendgrid uses send()
    return !emailClient.transporter
      ? emailClient.send(args)
      : emailClient.sendMail(args);
  }
};