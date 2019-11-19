/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */
const bcrypt = require('bcrypt');
const { buildGenericUserWithEmail } = require('./testHelper');
const { passRecovery, passRecoveryWithExpiredToken } = require('./mockModels');
const { injectMocks } = require('../rest/util/injection');

describe('Testing PassRecoveryService startPassRecoveryProcess', () => {
  let passRecoveryService;
  let userDao;
  let passRecoveryDao;
  let mailService;

  beforeAll(() => {
    userDao = {
      getUserByEmail: email => {
        return email === 'notvalid@email.com'
          ? undefined
          : buildGenericUserWithEmail(email);
      }
    };
    passRecoveryDao = {
      createRecovery: () => passRecovery
    };
    mailService = {
      sendMail: () => ({ accepted: ['dummy@email.com'] })
    };
    passRecoveryService = require('../rest/services/passRecoveryService');
    injectMocks(passRecoveryService, { passRecoveryDao, userDao, mailService });
    bcrypt.compare = jest.fn();
  });

  it('should success when the given email is found', async () => {
    bcrypt.compare.mockReturnValueOnce(true);
    const response = await passRecoveryService.startPassRecoveryProcess(
      'dummy@email.com'
    );
    expect(response).toEqual({ email: 'dummy@email.com' });
  });

  it('should fail with an error when the given email is not found', async () => {
    bcrypt.compare.mockReturnValueOnce(true);
    const response = await passRecoveryService.startPassRecoveryProcess(
      'notvalid@email.com'
    );
    expect(response).toEqual({
      status: 401,
      error: 'There is no user associated with that email'
    });
  });
});

describe('Testing PassRecoveryService updatePassword', () => {
  let passRecoveryDao;
  let userDao;
  let passRecoveryService;
  const TOKEN_NOT_FOUND = 'Token not found';
  const EXPIRED_TOKEN = 'Expired token';

  beforeAll(() => {
    passRecoveryDao = {
      findRecoverBytoken: token => {
        if (token === TOKEN_NOT_FOUND) return undefined;
        if (token === EXPIRED_TOKEN) return passRecoveryWithExpiredToken;
        return passRecovery;
      },
      deleteRecoverByToken: () => {}
    };
    userDao = { updatePasswordByMail: true };
    passRecoveryService = require('../rest/services/passRecoveryService');
    injectMocks(passRecoveryService, { passRecoveryDao, userDao });
    bcrypt.compare = jest.fn();
  });

  it('should succes when the token and password are valid', async () => {
    bcrypt.compare.mockReturnValueOnce(true);
    const response = passRecoveryService.updatePassword(
      '1d362dd70c3288ea7db239d04b57eea767112b0c77c5548a00',
      'newpassword'
    );
    expect(response).toBeTruthy();
  });

  it('should  fail with an error when the given token is not found on the database', async () => {
    bcrypt.compare.mockReturnValueOnce(true);
    const response = await passRecoveryService.updatePassword(TOKEN_NOT_FOUND);
    expect(response).toEqual({ status: 404, error: 'Invalid Token' });
  });

  it('should fail with an error when the given token has expired', async () => {
    bcrypt.compare.mockReturnValueOnce(true);
    const response = await passRecoveryService.updatePassword(EXPIRED_TOKEN);
    expect(response).toEqual({ status: 409, error: 'Token has expired' });
  });

  // TODO : this is not implemented yet, but the password should be evaluated (length and characters required) 
  it.skip('should fail with an error when the password is not valid', () => {});

});
