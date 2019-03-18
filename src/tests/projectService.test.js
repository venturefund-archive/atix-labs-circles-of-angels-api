const { assert } = require('chai');
const _ = require('lodash');

const fastify = { log: console.log };
//const { createProject, readProject } = require('../rest/core/projectService')();

describe.skip('Testing projectService createProject', () => {
  const fs = require('fs');
  const { promisify } = require('util');
  const readFile = promisify(fs.readFile);

  it('should create and return a new project from an excel file', async () => {
    const mockProject = {
      projectName: 'Project Name',
      mission: 'Project Mission',
      problemAddressed: 'Problem',
      location: 'Location',
      timeframe: 'Project Timeframe',
      ownerId: 1,
      status: 0
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

    const mockProjectPhoto = {
      name: 'projectPhoto.png',
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
      mockProjectPhoto,
      mockProjectMilestones
    );

    await assert.deepEqual(project, mockProject);
  });
});

describe.skip('Testing projectService readProject', () => {
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
      async getProjecListWithStatusFrom({ status }) {
        switch (status) {
          case -1:
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
              },
              {
                projectName: 'name',
                mission: 'mision',
                problemAddressed: 'problem',
                ownerId: 1,
                location: 'location',
                timeframe: '10/10/2019',
                photo: 'wdfwefdwefw.jpg',
                status: 0,
                createdAt: '2019-03-13T03:00:00.000Z',
                updatedAt: '2019-03-13T03:00:00.000Z',
                id: 1
              }
            ];
          case 1:
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
          default:
            return [];
        }
      }
    };
    projectService = require('../rest/core/projectService')({
      fastify,
      projectDao
    });
  });
  it('should return all active projects', async () => {
    const projects = await projectService.getActiveProjectList();
    expect(projects.length).toBe(1);
  });
  it('should return all  projects', async () => {
    const projects = await projectService.getProjectList();
    expect(projects.length).toBe(2);
  });
});

describe('Testing projectService get one project', () => {
  let projectDao;
  let projectService;
  beforeAll(() => {
    projectDao = {
      async getProjectById({ projectId }) {
        switch (projectId) {
          case 1:
            return {
              id: 1,
              projectName: 'name',
              status: '1'
            };
          default:
            return null;
        }
      }
    };
    projectService = require('../rest/core/projectService')({
      fastify,
      projectDao
    });
  });
  it('should return a one project if exists', async () => {
    const project = await projectService.getProjectWithId({ projectId: 1 });
    expect(project.id).toBe(1);
  });

  it('should return nothing if project doesnt exists', async () => {
    const project = await projectService.getProjectWithId({ projectId: 2 });
    expect(project).toBe(null);
  });
});

describe('Testing projectService delete one project', () => {
  let projectDao;
  let projectService;
  let projectModel;
  let mockProject = {
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
  };
  beforeEach(() => {
    projectModel = {
      projects: [mockProject],
      destroy({ id }) {
        const project = _.find(this.projects, element => {
          return element.id === id;
        });
        _.remove(this.projects, element => {
          return element.id === id;
        });
        return {
          fetch: () => {
            return project;
          }
        };
      }
    };
    projectDao = require('../rest/dao/projectDao')({ projectModel });
    projectService = require('../rest/core/projectService')({
      fastify,
      projectDao
    });
  });

  it('Delete existing project must return it and delete from database', async () => {
    let deletedProject = await projectService.deleteProject({ projectId: 1 });
    expect(deletedProject).toBe(mockProject);

    deletedProject = await projectService.deleteProject({ projectId: 1 });
    expect(deletedProject).toBeUndefined();
  });

  it('Delete non-existent project must return undefined', async () => {
    deletedProject = await projectService.deleteProject({ projectId: -1 });
    expect(deletedProject).toBeUndefined();
  })
});
