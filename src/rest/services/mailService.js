/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const { isEmpty } = require('lodash');
const config = require('config');

const validateRequiredParams = require('../services/helpers/validateRequiredParams');
const COAError = require('../errors/COAError');
const errors = require('../errors/exporter/ErrorExporter');
const templateParser = require('../services/helpers/templateParser');
const { templateNames } = require('../services/helpers/templateLoader');

const logger = require('../logger');

module.exports = {
  /**
   * Sends an email.
   *
   * @param {string} to - email's recipient.
   * @param {string} from - email's sender.
   * @param {string} subject - email's subject.
   * @param {number} text <= TODO : what is this?
   * @param {object} html - email's html content.
   * @returns
   */
  async sendMail({ to, from = config.email.from, subject, text, html }) {
    logger.info(`[MailService] :: Sending email to: ${to} subject: ${subject}`);
    validateRequiredParams({
      method: 'sendMail',
      params: { to, from, subject, html }
    });
    const info = await this.emailClient.sendMail({
      to,
      from,
      subject,
      text,
      html
    });
    // why isEmpty?
    if (!isEmpty(info.rejected)) {
      logger.info('[MailService] :: Invalid email account', info.rejected);
      throw new COAError(errors.mail.InvalidAccount);
    }
    return info;
  },

  async sendSignUpMail({
    to,
    subject = 'Welcome to Circles of Angels',
    text,
    bodyContent
  }) {
    logger.info('[MailService] :: Sending sign up mail to:', to);
    validateRequiredParams({
      method: 'sendSignUpMail',
      params: { to, subject, bodyContent }
    });

    const html = await templateParser.completeTemplate(
      {
        ...bodyContent,
        frontendUrl: config.frontendUrl
      },
      templateNames.SIGNUP
    );
    await this.sendMail({ to, subject, text, html });
  },

  async sendProjectStatusChangeMail({
    to,
    subject = 'Circles of Angels: A project has been updated',
    text,
    bodyContent
  }) {
    logger.info('[MailService] :: Sending project status change mail to:', to);
    validateRequiredParams({
      method: 'sendProjectStatusChangeMail',
      params: { to, subject, bodyContent }
    });

    const html = await templateParser.completeTemplate(
      {
        ...bodyContent,
        frontendUrl: config.frontendUrl
      },
      templateNames.PROJECT_STATUS_CHANGE
    );
    await this.sendMail({ to, subject, text, html });
  },

  async sendEmailVerification(
    to,
    subject = 'Circles of Angels: Account verification',
    text,
    bodyContent,
    userId
  ) {
    logger.info('[MailService] :: Sending verification mail to:', to);
    validateRequiredParams({
      method: 'sendEmailVerification',
      params: { to, subject, bodyContent }
    });

    const html = await templateParser.completeTemplate(
      {
        ...bodyContent,
        frontendUrl: config.frontendUrl
      },
      templateNames.EMAIL_CONFIRMATION
    );
    await this.sendMail({ to, subject, text, html });
  }
};
