const bcrypt = require('bcrypt');
const { userRegistrationStatus, userRoles } = require('../rest/util/constants');
const testHelper = require('./testHelper');
const ethServicesMock = require('../rest/services/eth/ethServicesMock')();

const fastify = {
  log: { info: console.log, error: console.log },
  eth: {
    createAccount: () =>
      '0x0d8cd6fd460d607b2590fb171a3dff04e33285830add91a2f9a4e43ced1ed01a'
  },
  configs: require('config')
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

    userService = require('../rest/core/userService')({
      fastify,
      userDao
    });

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

describe('Testing userService createUser', () => {
  let userDao;
  let userService;
  let roleDao;
  let questionnaireService;

  const mockUser = testHelper.buildUserSe({ id: 1 });

  beforeAll(() => {
    userDao = {
      async createUser(user) {
        if (user.username === '') {
          throw Error('Error creating user');
        }
        const createdUser = { ...user };
        createdUser.id = mockUser.id;
        return createdUser;
      },

      getUserByEmail(email) {
        if (email === 'existing@test.com') {
          return { id: 1, email };
        }
      }
    };

    roleDao = {
      getRoleById(role) {
        if (role > 0 && role < 5) {
          return { id: role };
        }
      }
    };

    questionnaireService = {
      saveQuestionnaireOfUser: () => true
    };

    userService = require('../rest/core/userService')({
      fastify,
      userDao,
      roleDao,
      questionnaireService
    });

    bcrypt.hash = jest.fn();
  });

  it("should return an object with the new user's information", async () => {
    bcrypt.hash.mockReturnValueOnce(mockUser.pwd);

    const expected = {
      id: mockUser.id,
      username: mockUser.username,
      email: mockUser.email,
      pwd: mockUser.pwd,
      role: mockUser.role,
      address: ethServicesMock.createAccount(),
      registrationStatus: userRegistrationStatus.PENDING_APPROVAL
    };

    const response = await userService.createUser(
      mockUser.username,
      mockUser.email,
      mockUser.pwd,
      mockUser.role
    );

    return expect(response).toEqual(expected);
  });

  it('should return an error if the creation fails', async () => {
    const pwd = '$2b$hashed';
    const username = '';
    const email = 'user@coa.com';
    const role = 1;

    bcrypt.hash.mockReturnValueOnce(pwd);

    return expect(
      userService.createUser(username, email, pwd, role)
    ).rejects.toEqual(Error('Error creating User'));
  });
});

describe('Testing userService getUserRole', () => {
  let userDao;
  let userService;

  const mockUser = testHelper.buildUserSe({ id: 1 });

  beforeAll(() => {
    userDao = {
      async getUserById(id) {
        if (id === 0) {
          return undefined;
        }

        if (id === 2) {
          delete mockUser.role;
          return mockUser;
        }

        mockUser.role = {
          id: mockUser.role,
          name: 'Social Entrepreneur'
        };

        return mockUser;
      }
    };

    userService = require('../rest/core/userService')({
      fastify,
      userDao
    });
  });

  it("should return a user's role", async () => {
    const mockRole = {
      id: userRoles.SOCIAL_ENTREPRENEUR,
      name: 'Social Entrepreneur'
    };

    const response = await userService.getUserRole(mockUser.id);
    return expect(response).toEqual(mockRole);
  });

  it("should return an error if the user doesn't exist", async () => {
    const userId = 0;
    const response = await userService.getUserRole(userId);

    return expect(response).toEqual({ error: 'User not found' });
  });

  it("should return an error if the user doesn't have a role", async () => {
    const userId = 2;
    const response = await userService.getUserRole(userId);

    return expect(response).toEqual({ error: "User doesn't have a role" });
  });
});
