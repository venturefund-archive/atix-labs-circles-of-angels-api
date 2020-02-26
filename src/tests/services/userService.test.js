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
const { Wallet } = require('ethers');
const { injectMocks } = require('../../rest/util/injection');
const { userRoles, projectStatuses } = require('../../rest/util/constants');
const errors = require('../../rest/errors/exporter/ErrorExporter');
const COAError = require('../../rest/errors/COAError');
const originalUserService = require('../../rest/services/userService');

let userService = Object.assign({}, originalUserService);
const restoreUserService = () => {
  userService = Object.assign({}, originalUserService);
};

const mailService = {
  sendMail: jest.fn()
};

describe('Testing userService', () => {
  let dbProject = [];
  let dbUser = [];
  let dbCountry = [];

  const resetDb = () => {
    dbProject = [];
    dbUser = [];
    dbCountry = [];
  };

  // USERS
  const userEntrepreneur = {
    id: 1,
    role: userRoles.ENTREPRENEUR
  };

  const userSupporter = {
    id: 2,
    firstName: 'SupporterFirstName',
    lastName: 'SupporterLastName',
    role: userRoles.PROJECT_SUPPORTER,
    email: 'supporter@test.com',
    blocked: false
  };

  const userAdmin = {
    id: 3,
    role: userRoles.COA_ADMIN
  };

  const blockedUser = {
    id: 4,
    firstName: 'BlockedFirstName',
    lastName: 'BlockedLastName',
    role: userRoles.PROJECT_SUPPORTER,
    email: 'blocked@test.com',
    blocked: true
  };

  // PROJECTS
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

  // COUNTRIES
  const argentinaCountry = {
    id: 1,
    name: 'Argentina'
  };

  const userDao = {
    findById: id => dbUser.find(user => user.id === id),
    getFollowedProjects: id => {
      const userFound = dbUser.find(user => user.id === id);
      userFound.following = [newProject, executingProject];
      return userFound;
    },
    getAppliedProjects: id => {
      const userFound = dbUser.find(user => user.id === id);
      userFound.funding = [newProject];
      userFound.monitoring = [executingProject];
      return userFound;
    },
    getUserByEmail: email => dbUser.find(user => user.email === email),
    createUser: user => {
      const created = { ...user, id: dbUser.length + 1 };
      dbUser.push(created);
      return created;
    },
    getUsers: () => dbUser.filter(user => user.role !== userRoles.COA_ADMIN)
  };

  const projectService = {
    getProjectsByOwner: owner =>
      dbProject.filter(project => project.owner === owner)
  };

  const countryService = {
    getCountryById: id => {
      const found = dbCountry.find(country => country.id === id);
      if (!found) {
        throw new COAError(errors.common.CantFindModelWithId('country', id));
      }
      return found;
    }
  };

  beforeEach(() => resetDb());

  describe('Testing getUserById', () => {
    beforeAll(() => {
      injectMocks(userService, { userDao });
    });
    afterAll(() => restoreUserService());

    beforeEach(() => {
      dbUser.push(userSupporter);
    });

    it('should return the existing user', async () => {
      const response = await userService.getUserById(userSupporter.id);
      expect(response).toEqual(userSupporter);
    });

    it('should throw an error if the user does not exist', async () => {
      await expect(userService.getUserById(0)).rejects.toThrow(
        errors.common.CantFindModelWithId('user', 0)
      );
    });
  });

  describe('Testing login', () => {
    beforeAll(() => {
      injectMocks(userService, { userDao });
      bcrypt.compare = jest.fn();
    });
    afterAll(() => restoreUserService());

    beforeEach(() => {
      dbUser.push(userSupporter, blockedUser);
    });

    it(
      'should return an object with the authenticated user information ' +
        'if the password matches',
      async () => {
        bcrypt.compare.mockReturnValueOnce(true);
        const response = await userService.login(
          userSupporter.email,
          'correctPass123*'
        );
        expect(response).toHaveProperty('id', userSupporter.id);
        expect(response).toHaveProperty('email', userSupporter.email);
        expect(response).toHaveProperty('role', userSupporter.role);
        expect(response).toHaveProperty('firstName', userSupporter.firstName);
        expect(response).toHaveProperty('lastName', userSupporter.lastName);
      }
    );

    it('should throw an error if a user with that email does not exist', async () => {
      await expect(userService.login('', 'anyPass123*')).rejects.toThrow(
        errors.user.InvalidUserOrPassword
      );
    });

    it('should throw an error if the email and password does not match', async () => {
      bcrypt.compare.mockReturnValueOnce(false);
      await expect(
        userService.login(userSupporter.email, 'wrongPass123*')
      ).rejects.toThrow(errors.user.InvalidUserOrPassword);
    });

    it(
      'should throw an error if the credentials were correct ' +
        'but the user is blocked',
      async () => {
        bcrypt.compare.mockReturnValueOnce(true);
        await expect(
          userService.login(blockedUser.email, 'correctPass123*')
        ).rejects.toThrow(errors.user.UserRejected);
      }
    );
  });

  describe('Testing createUser', () => {
    const newUser = {
      firstName: 'NewFirstName',
      lastName: 'NewLastName',
      email: 'new@email.com',
      password: 'newPass123*',
      role: userRoles.ENTREPRENEUR,
      country: 1,
      phoneNumber: '12345678',
      answers: JSON.stringify({
        'Question?': 'Test',
        'Another question?': 'OK'
      }),
      company: 'AtixLabs'
    };
    const mockedWallet = {
      address: 'address',
      privateKey: 'privKey'
    };

    beforeAll(() => {
      Wallet.createRandom = jest.fn();
      bcrypt.hash = jest.fn();
      injectMocks(userService, { userDao, mailService, countryService });
    });
    afterAll(() => restoreUserService());

    beforeEach(() => {
      dbCountry.push(argentinaCountry);
    });

    it("should return an object with the new user's information", async () => {
      Wallet.createRandom.mockReturnValueOnce(mockedWallet);
      bcrypt.hash.mockReturnValueOnce(newUser.password);
      const response = await userService.createUser(newUser);
      expect(response).toEqual({
        ...newUser,
        id: 1,
        address: mockedWallet.address,
        privKey: mockedWallet.privateKey
      });

      const created = dbUser.find(user => user.id === response.id);
      expect(created).toBeDefined();
    });
    it('should return an error if any required param is missing', async () => {
      await expect(
        userService.createUser({
          firstName: 'NewFirstName',
          lastName: 'NewLastName',
          email: 'new@email.com'
        })
      ).rejects.toThrow(errors.common.RequiredParamsMissing('createUser'));
    });
    it('should return an error if a user exists with the same email', async () => {
      dbUser.push(userSupporter);
      await expect(
        userService.createUser({ ...newUser, email: userSupporter.email })
      ).rejects.toThrow(errors.user.EmailAlreadyInUse);
    });
    it('should return an error if the country provided does not exist', async () => {
      await expect(
        userService.createUser({ ...newUser, country: 0 })
      ).rejects.toThrow(errors.common.CantFindModelWithId('country', 0));
    });
  });

  describe('Testing getUsers', () => {
    beforeAll(() => {
      injectMocks(userService, {
        userDao
      });
    });
    afterAll(() => restoreUserService());

    it('should return a list with all existing non admin users', async () => {
      dbUser.push(userEntrepreneur, userSupporter, userAdmin);
      const response = await userService.getUsers();
      expect(response).toHaveLength(2);
      expect(response).toEqual([userEntrepreneur, userSupporter]);
    });

    it('should return an empty array if no users were found', async () => {
      const response = await userService.getUsers();
      expect(response).toHaveLength(0);
    });
  });

  describe('Testing getProjectsOfUser', () => {
    beforeAll(() => {
      injectMocks(userService, {
        projectService,
        userDao
      });
    });
    afterAll(() => restoreUserService());

    beforeEach(() => {
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

  describe('Testing getFollowedProjects', () => {
    beforeAll(() => {
      injectMocks(userService, { userDao });
    });
    afterAll(() => restoreUserService());

    beforeEach(() => {
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

  describe.only('Testing getAppliedProjects', () => {
    beforeAll(() => {
      injectMocks(userService, { userDao });
    });

    beforeEach(() => {
      dbUser.push(userSupporter);
    });

    it('should return the array of applied projects belonging to the user', async () => {
      const response = await userService.getAppliedProjects({
        userId: userSupporter.id
      });

      expect(response.monitoring).toHaveLength(1);
      expect(response.funding).toHaveLength(1);
    });

    it("should fail if user doesn't exist", async () => {
      expect(userService.getAppliedProjects({ userId: 10 })).rejects.toThrow(
        errors.user.UserNotFound
      );
    });
  });

  describe('Testing validUser', () => {
    beforeAll(() => {
      injectMocks(userService, {
        userDao
      });
    });
    afterAll(() => restoreUserService());

    beforeEach(() => dbUser.push(userSupporter, blockedUser));

    it(
      'should return true if the user exists, is not blocked ' +
        'and the role is the same',
      async () => {
        await expect(
          userService.validUser(userSupporter, userRoles.PROJECT_SUPPORTER)
        ).resolves.toBe(true);
      }
    );

    it(
      'should return false if the user exists, is not blocked ' +
        'but the role is not the same',
      async () => {
        await expect(
          userService.validUser(userSupporter, userRoles.ENTREPRENEUR)
        ).resolves.toBe(false);
      }
    );

    it(
      'should return false if the user exists, the role is the same ' +
        'but is blocked',
      async () => {
        await expect(
          userService.validUser(blockedUser, userRoles.PROJECT_SUPPORTER)
        ).resolves.toBe(false);
      }
    );

    it('should throw an error if the user does not exist', async () => {
      await expect(
        userService.validUser({ id: 0 }, userRoles.PROJECT_SUPPORTER)
      ).rejects.toThrow(errors.common.CantFindModelWithId('user', 0));
    });
  });

  test.todo('getUserWallet');
});
