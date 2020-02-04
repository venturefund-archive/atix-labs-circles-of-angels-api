/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart
 * contracts to develop impact milestones agreed
 * upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */
const { injectMocks } = require('../../rest/util/injection');
const mailService = require('../../rest/services/mailService');

describe('Testing mailService', () => {
  const email = {
    from: 'coa@support.com',
    to: 'user@test.com',
    subject: 'Hello from COA',
    text: 'Welcome to',
    hmtl: '<b>COA</b>'
  };

  const emailClient = {
    sendMail: args => {
      if (!args) throw Error('mailerror');
      if (!args.to) return { rejected: 'rejected' };
      return args;
    }
  };

  describe('sendMail method', () => {
    beforeAll(() => {
      injectMocks(mailService, {
        emailClient
      });
    });

    it('should send an email and return the info', async () => {
      const response = await mailService.sendMail(email);
      expect(response).toEqual(email);
    });

    it('should throw an error if the email was rejected', async () => {
      expect(mailService.sendMail({ ...email, to: undefined })).rejects.toThrow(
        'Invalid email'
      );
    });

    it('should throw an error if the email service fails', async () => {
      await expect(mailService.sendMail({})).rejects.toThrow(
        'An error has occurred sending an email'
      );
    });
  });
});
