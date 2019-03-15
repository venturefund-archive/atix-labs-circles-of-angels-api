const { assert } = require('chai');

const fastify = { log: { info: console.log, error: console.log } };

describe('Testing projectService createProject', () => {
  const fs = require('fs');
  const { promisify } = require('util');
  const readFile = promisify(fs.readFile);

  let projectDao;
  let projectService;
  let milestoneService;

  beforeAll(() => {
    projectDao = {
      async saveProject(project) {
        return project;
      }
    };

    milestoneService = {
      async createMilestones() {
        return null;
      }
    };

    projectService = require('../rest/core/projectService')({
      fastify,
      projectDao,
      milestoneService
    });
  });

  it('should create and return a new project from an excel file', async () => {
    const mockProject = {
      projectName: 'Project Name',
      mission: 'Project Mission',
      problemAddressed: 'Problem',
      location: 'Location',
      timeframe: 'Project Timeframe',
      ownerId: 1,
      status: 0,
      coverPhoto: '/home/atixlabs/files/server/projectCoverPhoto.png',
      cardPhoto: '/home/atixlabs/files/server/projectCardPhoto.png'
    };

    const pathProjectXls = require('path').join(
      __dirname,
      './mockFiles/projectXls.xlsx'
    );
    const pathMilestonesXls = require('path').join(
      __dirname,
      './mockFiles/projectMilestones.xlsx'
    );

    const dataXls = await readFile(pathProjectXls);
    const dataMilestones = await readFile(pathMilestonesXls);

    const mockProjectXls = {
      name: 'projectXls.xlsx',
      data: dataXls,
      mv: jest.fn()
    };

    const mockProjectCoverPhoto = {
      name: 'projectCoverPhoto.png',
      data: dataXls,
      mv: jest.fn()
    };

    const mockProjectCardPhoto = {
      name: 'projectCardPhoto.png',
      data: dataXls,
      mv: jest.fn()
    };

    const mockProjectMilestones = {
      name: 'projectMilestones.xlsx',
      data: dataMilestones,
      mv: jest.fn()
    };

    const p = await projectService.readProject(pathProjectXls);

    projectService.readProject = jest.fn(() => p);

    const project = await projectService.createProject(
      mockProjectXls,
      mockProjectCoverPhoto,
      mockProjectCardPhoto,
      mockProjectMilestones
    );

    await assert.deepEqual(project, mockProject);
  });
});

describe('Testing projectService readProject', () => {
  let projectDao;
  let projectService;
  let milestoneService;

  beforeAll(() => {
    projectDao = {};

    milestoneService = {};

    projectService = require('../rest/core/projectService')({
      fastify,
      projectDao,
      milestoneService
    });
  });

  it('should return a project object from an excel file', async () => {
    const mockProject = {
      projectName: 'Project Name',
      mission: 'Project Mission',
      problemAddressed: 'Problem',
      location: 'Location',
      timeframe: 'Project Timeframe'
    };

    const mockXls = require('path').join(
      __dirname,
      './mockFiles/projectXls.xlsx'
    );
    const project = await projectService.readProject(mockXls);
    assert.deepEqual(project, mockProject);
  });

  it('should throw an error when file not found', async () => {
    await expect(projectService.readProject('')).rejects.toEqual(
      Error('Error reading excel file')
    );
  });
});

describe('Testing projectService getProjectList', () => {
  let projectDao;
  let projectService;
  beforeAll(() => {
    projectDao = {
      async getProjectList() {
        return [
          {
            projectName: 'name',
            mission: 'mision',
            problemAddressed: 'problem',
            ownerId: 1,
            location: 'location',
            timeframe: '10/10/2019',
            photo: 'wdfwefdwefw.jpg',
            status: 1,
            createdAt: '2019-03-13T03:00:00.000Z',
            updatedAt: '2019-03-13T03:00:00.000Z',
            id: 1
          }
        ];
      }
    };
    projectService = require('../rest/core/projectService')({
      fastify,
      projectDao
    });
  });
  it('should return all active projects', async () => {
    const projects = await projectService.getProjectList();
    expect(projects.length).toBe(1);
  });
});
