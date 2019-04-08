const bcrypt = require('bcrypt');

const fastify = { log: { info: console.log, error: console.log } };

describe('Testing userService login', () => {
  let userDao;
  let userService;

  beforeAll(() => {
    userDao = {
      async getUserByEmail(email) {
        if (email === '') {
          return undefined;
        }

        const user = {
          id: 1,
          username: 'User Name',
          email,
          pwd: '$2b$hash',
          role: {
            id: 1,
            name: 'BO Admin'
          }
        };
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
    // eslint-disable-next-line prettier/prettier
    'should return an object with the user\'s information ' +
      'if the login is successful',
    async () => {
      bcrypt.compare.mockReturnValueOnce(true);

      const email = 'user@coa.com';

      const mockUser = {
        id: 1,
        username: 'User Name',
        email,
        role: {
          id: 1,
          name: 'BO Admin'
        }
      };

      const response = await userService.login(email);

      return expect(response).toEqual(mockUser);
    }
  );

  it(
    // eslint-disable-next-line prettier/prettier
    'should return an error message ' +
      'if the passwords didn\'t match',
    async () => {
      bcrypt.compare.mockReturnValueOnce(false);

      const email = 'user@coa.com';

      const mockError = {
        error: 'Login failed. Incorrect user or password.'
      };

      const response = await userService.login(email);

      return expect(response).toEqual(mockError);
    }
  );

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

  beforeAll(() => {
    userDao = {
      async createUser(user) {
        if (user.username === '') {
          throw Error('Error creating user');
        }
        const savedUser = {
          id: 1,
          username: user.username,
          email: user.email,
          pwd: user.pwd,
          role: user.role
        };
        return savedUser;
      }
    };

    userService = require('../rest/core/userService')({
      fastify,
      userDao
    });

    bcrypt.hash = jest.fn();
  });

  // eslint-disable-next-line prettier/prettier
  it('should return an object with the new user\'s information', async () => {
    const pwd = '$2b$hashed';
    const username = 'User Name';
    const email = 'user@coa.com';
    const role = 1;

    bcrypt.hash.mockReturnValueOnce(pwd);

    const mockUser = {
      id: 1,
      username,
      email,
      pwd,
      role
    };

    const response = await userService.createUser(username, email, pwd, role);

    return expect(response).toEqual(mockUser);
  });

  it('should return an error if the creation fails', async () => {
    const pwd = '$2b$hashed';
    const username = '';
    const email = 'user@coa.com';
    const role = 1;

    bcrypt.hash.mockReturnValueOnce(pwd);

    const response = await userService.createUser(username, email, pwd, role);

    return expect(response).toEqual({ error: Error('Error creating user') });
  });
});

describe('Testing userService getUserRole', () => {
  let userDao;
  let userService;

  beforeAll(() => {
    userDao = {
      async getUserById(id) {
        if (id === 0) {
          return undefined;
        }

        if (id === 2) {
          return {
            id,
            username: 'User Name',
            email: 'user@coa.com',
            pwd: '$2b$hash'
          };
        }

        return {
          id,
          username: 'User Name',
          email: 'user@coa.com',
          pwd: '$2b$hash',
          role: {
            id: 1,
            name: 'BO Admin'
          }
        };
      }
    };

    userService = require('../rest/core/userService')({
      fastify,
      userDao
    });
  });

  // eslint-disable-next-line prettier/prettier
  it('should return a user\'s role', async () => {
    const userId = 1;
    const mockRole = {
      id: 1,
      name: 'BO Admin'
    };

    const response = await userService.getUserRole(userId);

    return expect(response).toEqual(mockRole);
  });

  // eslint-disable-next-line prettier/prettier
  it('should return an error if the user doesn\'t exist', async () => {
    const userId = 0;
    const response = await userService.getUserRole(userId);

    return expect(response).toEqual({ error: 'User not found' });
  });

  // eslint-disable-next-line prettier/prettier
  it('should return an error if the user doesn\'t have a role', async () => {
    const userId = 2;
    const response = await userService.getUserRole(userId);

    // eslint-disable-next-line prettier/prettier
    return expect(response).toEqual({ error: 'User doesn\'t have a role' });
  });
});
