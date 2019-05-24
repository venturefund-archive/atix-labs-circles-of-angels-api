const configs = require('../../config/configs')(
  process.env.NODE_ENV || 'development'
);

const fastify = {
  log: { info: console.log, error: console.log },
  configs
};

describe('Testing userProjectService signAgreement', () => {
  let userProjectDao;
  let userProjectService;

  beforeAll(() => {
    userProjectDao = {
      async updateStatus({ userProject, newStatus }) {
        const toSave = Object.assign({}, userProject, { status: newStatus });
        return toSave;
      },

      async findUserProject({ userId, projectId }) {
        if (userId === 0 && projectId === 0) {
          return undefined;
        }

        if (userId === 100 && projectId === 100) {
          return { id: 1, userId, projectId, status: 1 };
        }

        return { id: 1, userId, projectId, status: 0 };
      }
    };

    userProjectService = require('../rest/core/userProjectService')({
      fastify,
      userProjectDao
    });
  });

  it('should return a userProject object with status = 1', async () => {
    const userId = 12;
    const projectId = 14;

    const mockUserProject = {
      id: 1,
      userId,
      projectId,
      status: 1
    };

    const userProject = await userProjectService.signAgreement({
      userId,
      projectId
    });

    await expect(userProject).toEqual(mockUserProject);
  });

  it('should return a not found error when the userProject is undefined', async () => {
    const userId = 0;
    const projectId = 0;

    const result = { error: 'User Project relation not found', status: 404 };

    const userProject = await userProjectService.signAgreement({
      userId,
      projectId
    });

    await expect(userProject).toEqual(result);
  });

  it('should return an already signed error when the userProject found has status = 1', async () => {
    const userId = 100;
    const projectId = 100;

    const result = { error: 'Agreement already signed', status: 409 };

    const userProject = await userProjectService.signAgreement({
      userId,
      projectId
    });

    await expect(userProject).toEqual(result);
  });
});
