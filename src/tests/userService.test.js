/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const bcrypt = require('bcrypt');
const testHelper = require('./testHelper');
const ethServicesMock = require('../rest/services/eth/ethServicesMock')();
const { injectMocks } = require('../rest/util/injection');

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
        const userSe = testHelper.buildUserSe(userId);
        const blockedUser = testHelper.buildBlockedUser(userId);
        const users = [userSe, blockedUser];
        const filteredUsers = users.filter(user => user.email === email);

        return filteredUsers[0];
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

  it('should return an error with blocked by an admin message ', async () => {
    bcrypt.compare.mockReturnValueOnce(true);

    const mockUser = testHelper.buildBlockedUser(userId);
    const expected = 'User was blocked by an admin';

    const { error } = await userService.login(mockUser.email);
    expect(error).toEqual(expected);
  });
});

describe('Testing userService createUser', () => {
  let userDao;
  let userService;
  let roleDao;
  let questionnaireService;

  const mockUser = testHelper.buildUserSe(1);
  const existingMail = 'existing@test.com';

  beforeAll(() => {
    userDao = {
      async createUser(user) {
        if (user.email === '') {
          return undefined;
        }

        if (user.username === '') {
          throw Error('Error creating user');
        }
        const createdUser = { ...user };
        createdUser.id = mockUser.id;
        return createdUser;
      },

      getUserByEmail(email) {
        if (email === existingMail) {
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

    userService = require('../rest/services/userService');
    injectMocks(userService, {
      userDao,
      roleDao,
      mailService,
      questionnaireService
    });

    bcrypt.hash = jest.fn();
  });

  // TODO : depends on refactor of eth service, skip it for now
  it.skip("should return an object with the new user's information", async () => {
    bcrypt.hash.mockReturnValueOnce(mockUser.pwd);

    // TODO : test privkey
    const expected = {
      id: mockUser.id,
      username: mockUser.username,
      email: mockUser.email,
      pwd: mockUser.pwd,
      role: mockUser.role,
      address: mockUser.address,
      privKey: '', //mockUser.privKey,
      registrationStatus: 1
    };

    const response = await userService.createUser(
      mockUser.username,
      mockUser.email,
      mockUser.pwd,
      mockUser.role
    );

    return expect(response).toEqual(expected);
  });

  it('should throw an error if the creation fails', async () => {
    const { pwd, email, role } = mockUser;
    const username = '';

    bcrypt.hash.mockReturnValueOnce(pwd);

    return expect(
      userService.createUser(username, email, pwd, role)
    ).rejects.toEqual(Error('Error creating User'));
  });

  it('should return an error if another user with the same email exists', async () => {
    const expected = {
      status: 409,
      error: 'A user with that email already exists'
    };

    const response = await userService.createUser(
      mockUser.username,
      existingMail,
      mockUser.pwd,
      mockUser.role
    );

    return expect(response).toEqual(expected);
  });

  it('should return an error if the specified role is not valid', async () => {
    const expected = {
      status: 404,
      error: 'User role does not exist'
    };

    const response = await userService.createUser(
      mockUser.username,
      mockUser.email,
      mockUser.pwd,
      5
    );

    return expect(response).toEqual(expected);
  });

  it('should return an error if the creation returns undefined', async () => {
    const expected = {
      status: 500,
      error: 'There was an unexpected error creating the user'
    };

    const response = await userService.createUser(
      mockUser.username,
      '',
      mockUser.pwd,
      mockUser.role
    );

    return expect(response).toEqual(expected);
  });
});

describe('Testing userService getUserRole', () => {
  let userDao;
  let userService;

  const mockUser = testHelper.buildUserSe(1);

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

    userService = require('../rest/services/userService');
    injectMocks(userService, {
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

describe('Testing userService updateUser', () => {
  let userDao;
  let userService;

  const mockUser = testHelper.buildUserSe(1);

  beforeAll(() => {
    userDao = {
      async getUserById(id) {
        if (id === 0) {
          return undefined;
        }

        return mockUser;
      },

      async getUserByEmail(email) {
        if (email === 'existing@test.com') {
          return { id: 15, email };
        }

        return undefined;
      },

      async updateUser(id, user) {
        if (id === '') {
          throw Error('Error updating');
        }

        const updatedUser = { ...mockUser, ...user };
        return updatedUser;
      }
    };

    userService = require('../rest/services/userService');
    injectMocks(userService, {
      userDao
    });

    bcrypt.hash = jest.fn();
  });

  it('should return the updated user', async () => {
    const toUpdateUser = {
      ...mockUser,
      pwd: 'atix2019',
      email: 'updated@test.com',
      blocked: false
    };

    const hashedPwd = '$2b$ae321f';
    bcrypt.hash.mockReturnValueOnce(hashedPwd);

    const expected = {
      ...mockUser,
      ...toUpdateUser,
      pwd: hashedPwd
    };

    const response = await userService.updateUser(mockUser.id, toUpdateUser);
    return expect(response).toEqual(expected);
  });

  it('should return an error if the user does not exist', async () => {
    const toUpdateUser = {
      pwd: 'atix2019',
      email: 'updated@test.com',
      blocked: false
    };

    const expected = {
      status: 404,
      error: 'User does not exist'
    };

    const response = await userService.updateUser(0, toUpdateUser);
    return expect(response).toEqual(expected);
  });

  it('should return an error if another user with the same email exists', async () => {
    const toUpdateUser = {
      pwd: 'atix2019',
      email: 'existing@test.com',
      blocked: false
    };

    const expected = {
      status: 409,
      error: 'A user with that email already exists'
    };

    const response = await userService.updateUser(mockUser.id, toUpdateUser);
    return expect(response).toEqual(expected);
  });

  // TODO : this test wont have much sense later. we keep it for archaeological purposes.
  it.skip('should return an error if the registration status is not valid', async () => {
    const toUpdateUser = {
      pwd: 'atix2019',
      email: 'updated@test.com',
      registrationStatus: 5
    };

    const expected = {
      status: 404,
      error: 'Registration status is not valid'
    };

    const response = await userService.updateUser(mockUser.id, toUpdateUser);
    return expect(response).toEqual(expected);
  });

  it('should throw an error if the user could not be updated', async () => {
    const toUpdateUser = {
      pwd: 'atix2019',
      email: 'updated@test.com',
      blocked: false
    };

    return expect(userService.updateUser(-1)).rejects.toEqual(
      Error('Error updating User')
    );
  });
});

describe('Testing userService getUsers', () => {
  let userDao;
  let questionnaireService;
  let userFunderDao;
  let userSocialEntrepreneurDao;
  let userService;

  const funderId = 1;
  const seId = 2;
  const oracleId = 3;

  const mockUserFunder = testHelper.populateUserRole(
    testHelper.buildUserFunder(funderId)
  );
  const mockUserSe = testHelper.populateUserRole(testHelper.buildUserSe(seId));
  const mockUserOracle = testHelper.populateUserRole(
    testHelper.buildUserOracle(oracleId)
  );

  beforeAll(() => {
    userDao = {
      async getUsers() {
        const users = [mockUserFunder, mockUserSe, mockUserOracle];
        return users;
      }
    };

    userFunderDao = {
      async getByUserId(userId) {
        return testHelper.buildUserFunderDetails(userId);
      }
    };

    userSocialEntrepreneurDao = {
      async getByUserId(userId) {
        return testHelper.buildUserSeDetails(userId);
      }
    };

    questionnaireService = {
      async getAnswersOfUser(user) {
        if (user.role.id === userRoles.IMPACT_FUNDER) {
          return testHelper.buildUserFunderAnswers(user.id);
        }

        if (user.role.id === userRoles.SOCIAL_ENTREPRENEUR) {
          return testHelper.buildUserSeAnswers(user.id);
        }

        return [];
      }
    };

    userService = require('../rest/services/userService');
    injectMocks(userService, {
      userDao,
      userSocialEntrepreneurDao,
      userFunderDao,
      questionnaireService
    });
  });

  it('should return a list with all users', async () => {
    const expected = [];
    expected.push(
      testHelper.populateUserRole(
        testHelper.buildUserFunderWithDetails(funderId)
      )
    );
    expected.push(
      testHelper.populateUserRole(testHelper.buildUserSeWithDetails(seId))
    );
    expected.push(mockUserOracle);

    const response = await userService.getUsers();

    return expect(response).toEqual(expected);
  });

  it('should return an empty array when there are no users', async () => {
    const expected = [];

    userDao.getUsers = () => [];

    const response = await userService.getUsers();

    return expect(response).toEqual(expected);
  });

  it('should throw an error when it fails to get the users from database', async () => {
    userDao.getUsers = () => {
      throw Error('DB Error');
    };

    return expect(userService.getUsers()).rejects.toEqual(
      Error('Error getting all Users')
    );
  });
});

describe('Testing userService getProjectsOfUser', () => {
  let userService;
  let userProjectService;
  let projectService;

  const adminId = 1;
  const seId = 2;
  const funderId = 3;
  const oracleId = 4;

  const funderProjects = testHelper.getMockActiveProjects();
  const seProjects = userId => [
    testHelper.buildProject(1, 1, { id: 1, ownerId: userId }),
    testHelper.buildProject(1, 1, { id: 2, ownerId: userId })
  ];

  const oracleProjects = testHelper
    .getMockActiveProjects()
    .filter(project => project.id === 3 || project.id === 4);

  beforeAll(() => {
    userProjectService = {
      async getProjectsOfUser() {
        return funderProjects;
      }
    };

    projectService = {
      async getAllProjectsById(projects) {
        return testHelper
          .getMockActiveProjects()
          .filter(project => projects.indexOf(project.id) !== -1);
      },

      async getProjectsAsOracle(userId) {
        return { projects: [3, 4], oracle: userId };
      },

      async getProjectsOfOwner(userId) {
        return seProjects(userId);
      }
    };

    userService = require('../rest/services/userService');
    injectMocks(userService, { projectService, userProjectService });

    userService.getUserById = userId => {
      switch (userId) {
        case seId:
          return testHelper.populateUserRole(testHelper.buildUserSe(userId));
        case funderId:
          return testHelper.populateUserRole(
            testHelper.buildUserFunder(userId)
          );
        case oracleId:
          return testHelper.populateUserRole(
            testHelper.buildUserOracle(userId)
          );
        case adminId:
          return testHelper.populateUserRole(testHelper.buildUserAdmin(userId));
        default:
          return undefined;
      }
    };
  });

  it.skip('should return an array of projects related to a funder', async () => {
    const expectedFunder = funderProjects;
    const responseFunder = await userService.getProjectsOfUser(
      funderId,
      userProjectService,
      projectService
    );

    await expect(responseFunder).toEqual(expectedFunder);
  });

  it.skip('should return an array of projects with owner same as user SE', async () => {
    const expectedSe = seProjects(seId);
    const responseSe = await userService.getProjectsOfUser(
      seId,
      userProjectService,
      projectService
    );

    await expect(responseSe).toEqual(expectedSe);
  });

  it.skip('should return an array of projects related to an oracle', async () => {
    const expectedOracle = oracleProjects;
    const responseOracle = await userService.getProjectsOfUser(
      oracleId,
      userProjectService,
      projectService
    );

    await expect(responseOracle).toEqual(expectedOracle);
  });

  it.skip('should return an error if the user is an admin', async () => {
    const expected = { status: 409, error: 'Invalid User' };
    const response = await userService.getProjectsOfUser(
      adminId,
      userProjectService,
      projectService
    );

    await expect(response).toEqual(expected);
  });

  it.skip('should return an error if the user does not exist', async () => {
    const expected = { status: 404, error: 'Nonexistent User' };
    const response = await userService.getProjectsOfUser(
      0,
      userProjectService,
      projectService
    );

    await expect(response).toEqual(expected);
  });
});
