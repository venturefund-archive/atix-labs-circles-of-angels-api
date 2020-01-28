/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart
 * contracts to develop impact milestones agreed
 * upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const bcrypt = require('bcrypt');
const testHelper = require('./testHelper');
const { injectMocks } = require('../rest/util/injection');
const { userRoles, projectStatuses } = require('../rest/util/constants');
const userService = require('../rest/services/userService');
const errors = require('../rest/errors/exporter/ErrorExporter');

const mailService = {
  sendMail: async () => {
    // eslint-disable-next-line
    console.log('mail sent');
  }
};

describe('Testing userService', () => {
  let dbProject = [];
  let dbUser = [];

  const resetDb = () => {
    dbProject = [];
    dbUser = [];
  };

  const userEntrepreneur = {
    id: 1,
    role: userRoles.ENTREPRENEUR
  };

  const userSupporter = {
    id: 2,
    role: userRoles.PROJECT_SUPPORTER
  };

  const userAdmin = {
    id: 3,
    role: userRoles.COA_ADMIN
  };

  const newProject = {
    id: 1,
    status: projectStatuses.NEW,
    owner: userEntrepreneur.id
  };

  const executingProject = {
    id: 2,
    status: projectStatuses.EXECUTING,
    owner: userEntrepreneur.id
  };

  const userDao = {
    findById: id => dbUser.find(user => user.id === id),
    getFollowedProjects: id => {
      const userFound = dbUser.find(user => user.id === id);
      userFound.following = [newProject, executingProject];
      return userFound;
    }
  };

  const projectService = {
    getProjectsByOwner: owner =>
      dbProject.filter(project => project.owner === owner)
  };

  describe('Get projects of user', () => {
    beforeAll(() => {
      injectMocks(userService, {
        projectService,
        userDao
      });
    });

    beforeEach(() => {
      resetDb();
      dbProject.push(newProject, executingProject);
      dbUser.push(userEntrepreneur, userSupporter, userAdmin);
    });

    it('should return the array of projects belonging to the entrepreneur', async () => {
      const response = await userService.getProjectsOfUser(userEntrepreneur.id);
      expect(response).toHaveLength(2);
    });

    it('should return the array of projects related to the supporter', async () => {
      // TODO: add functionality to actual method
      const response = await userService.getProjectsOfUser(userSupporter.id);
      expect(response).toHaveLength(0);
    });

    it('should return an empty array if the user is not a supporter or entrepreneur', async () => {
      const response = await userService.getProjectsOfUser(userAdmin.id);
      expect(response).toHaveLength(0);
    });
  });

  describe('Get followed projects of user', () => {
    beforeAll(() => {
      injectMocks(userService, { userDao });
    });

    beforeEach(() => {
      resetDb();
      dbUser.push(userSupporter);
    });

    it('should return the array of followed projects belonging to the user', async () => {
      const response = await userService.getFollowedProjects({
        userId: userSupporter.id
      });

      expect(response).toHaveLength(2);
    });

    it("should fail if user doesn't exist", async () => {
      expect(userService.getFollowedProjects({ userId: 10 })).rejects.toThrow(
        errors.user.UserNotFound
      );
    });
  });
});

describe.skip('Testing userService login', () => {
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
        role: mockUser.role
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

  it.skip('should return an error with blocked by an admin message ', async () => {
    bcrypt.compare.mockReturnValueOnce(true);

    const mockUser = testHelper.buildBlockedUser(userId);
    const expected = 'Login failed. Incorrect user or password.';

    const { error } = await userService.login(mockUser.email);
    expect(error).toEqual(expected);
  });
});

describe.skip('Testing userService createUser', () => {
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

  it('should create a random private key', async () => {
    bcrypt.hash.mockReturnValueOnce(mockUser.pwd);
    const response = await userService.createUser(
      mockUser.username,
      mockUser.email,
      mockUser.pwd,
      mockUser.role
    );
    expect(response.privKey).toHaveLength(66);
    expect(response.address).toHaveLength(42);
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
      privKey: '', // mockUser.privKey,
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

    await expect(userService.createUser(username, email, pwd, role)).rejects;
  });

  it('should return an error if another user with the same email exists', async () => {
    await expect(
      userService.createUser(
        mockUser.username,
        existingMail,
        mockUser.pwd,
        mockUser.role
      )
    ).rejects;
  });

  it.skip('should return an error if the specified role is not valid', async () => {
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
    await expect(
      userService.createUser(mockUser.username, '', mockUser.pwd, mockUser.role)
    ).rejects;
  });
});

describe.skip('Testing userService getUserRole', () => {
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

  it.skip("should return a user's role", async () => {
    const mockRole = {
      id: userRoles.SOCIAL_ENTREPRENEUR,
      name: 'Social Entrepreneur'
    };

    const response = await userService.getUserRole(mockUser.id);
    return expect(response).toEqual(mockRole);
  });

  it("should return an error if the user doesn't exist", async () => {
    const userId = 0;
    await expect(userService.getUserRole(userId)).rejects;
  });

  it("should return an error if the user doesn't have a role", async () => {
    const userId = 2;
    await expect(userService.getUserRole(userId)).rejects;
  });
});

describe.skip('Testing userService updateUser', () => {
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

    await expect(userService.updateUser(0, toUpdateUser)).rejects;
  });

  it('should return an error if another user with the same email exists', async () => {
    const toUpdateUser = {
      pwd: 'atix2019',
      email: 'existing@test.com',
      blocked: false
    };

    await expect(userService.updateUser(mockUser.id, toUpdateUser)).rejects;
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

  it.skip('should throw an error if the user could not be updated', async () => {
    const toUpdateUser = {
      pwd: 'atix2019',
      email: 'updated@test.com',
      blocked: false
    };

    return expect(userService.updateUser(-1)).rejects.toThrow(
      Error('Error updating User')
    );
  });
});
describe.skip('Testing userService getUsers', () => {
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

  it.skip('should throw an error when it fails to get the users from database', async () => {
    userDao.getUsers = () => {
      throw Error('DB Error');
    };
    return expect(() => userService.getUsers()).toThrow('Error');
  });
});
