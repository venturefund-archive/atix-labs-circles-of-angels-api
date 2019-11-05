/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const { isEmpty } = require('lodash');

console.log('MailService loading up...');
module.exports = {
  /**
   * Sends an email.
   *
   * @param {string} from - email's account.
   * @param {string} to - email's recipient.
   * @param {string} subject - email's subject.
   * @param {number} text <= TODO : what is this?
   * @param {object} content - email's content.
   * @returns
  */
  async sendMail(from, to, subject, text, content) {
    try {
      const info = await this.emailClient.sendMail({
        from,
        to,
        subject,
        text,
        content
      });
      if (!isEmpty(info.rejected)) {
        fastify.log.info(
          '[User Service] :: Invalid email account',
          info.rejected
        );
        throw new Error(409, 'Invalid email');
      }
      return info;
    } catch (error) {
      fastify.log.error('[User Service] :: Error creating User:', error);
      throw new Error('An error has occurred sending an email');
    }
  }
};
