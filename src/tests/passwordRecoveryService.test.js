/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const bcrypt = require('bcrypt');
const { userRegistrationStatus, userRoles } = require('../rest/util/constants');
const testHelper = require('./testHelper');
const ethServicesMock = require('../rest/services/eth/ethServicesMock')();
const { injectMocks } = require('../rest/util/injection');

describe('Testing PassRecoveryService startPassRecoveryProcess', () => {});
describe('Testing PassRecoveryService updatePassword', () => {});

const fastify = {
  log: { info: jest.fn(), error: jest.fn() },
  eth: ethServicesMock,
  configs: require('config')
};

const mailService = {
  sendMail: async () => console.log('mail sent')
};


describe('Testing userService login', () => {
  let userDao;
  let userService;
  const userId = 1;

  beforeAll(() => {
    userDao = {
      async getUserByEmail(email) {
        if (email === '') {
          return undefined;
        }

        const user = testHelper.buildUserSe(userId);
        return user;
      }
    };

    userService = require('../rest/services/userService');
    injectMocks(userService, { userDao });

    bcrypt.compare = jest.fn();
  });

  it(
    "should return an object with the user's information " +
      'if the login is successful',
    async () => {
      bcrypt.compare.mockReturnValueOnce(true);

      const mockUser = testHelper.buildUserSe(userId);
      const expected = {
        username: mockUser.username,
        email: mockUser.email,
        id: mockUser.id,
        role: mockUser.role,
        registrationStatus: mockUser.registrationStatus
      };

      const response = await userService.login(mockUser.email);
      return expect(response).toEqual(expected);
    }
  );

  it("should return an error message if the passwords didn't match", async () => {
    bcrypt.compare.mockReturnValueOnce(false);

    const email = 'user@coa.com';

    const mockError = {
      error: 'Login failed. Incorrect user or password.'
    };

    const response = await userService.login(email);

    return expect(response).toEqual(mockError);
  });

  it('should return an error message if the user could not be found', async () => {
    const email = '';

    const mockError = {
      error: 'Login failed. Incorrect user or password.'
    };

    const response = await userService.login(email);

    return expect(response).toEqual(mockError);
  });
});
