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
        const toSave = Object.assign({}, project, { id: 1 });
        return toSave;
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

  it('should create and return a new project from a JSON object', async () => {
    const mockProject = JSON.stringify({
      projectName: 'Project Name',
      mission: 'Project Mission',
      problemAddressed: 'Problem',
      location: 'Location',
      timeframe: 'Project Timeframe',
      goalAmount: 9000,
      faqLink: 'http://www.google.com/'
    });

    const savedProject = {
      projectName: 'Project Name',
      mission: 'Project Mission',
      problemAddressed: 'Problem',
      location: 'Location',
      timeframe: 'Project Timeframe',
      goalAmount: 9000,
      faqLink: 'http://www.google.com/',
      ownerId: 1,
      status: 0,
      coverPhoto: 'coverPhoto.png',
      cardPhoto: 'cardPhoto.png',
      pitchProposal: 'pitchProposal.pdf',
      id: 1
    };

    const pathMilestonesXls = require('path').join(
      __dirname,
      './mockFiles/projectMilestones.xlsx'
    );

    const dataMilestones = await readFile(pathMilestonesXls);

    const mockProjectCoverPhoto = {
      name: 'projectCoverPhoto.png',
      mv: jest.fn()
    };

    const mockProjectCardPhoto = {
      name: 'projectCardPhoto.png',
      data: dataXls
    };

    const mockProjectProposal = {
      name: 'projectProposal.pdf',
      mv: jest.fn()
    };

    const mockProjectMilestones = {
      name: 'projectMilestones.xlsx',
      data: dataMilestones,
      mv: jest.fn()
    };

    const project = await projectService.createProject(
      mockProject,
      mockProjectProposal,
      mockProjectCoverPhoto,
      mockProjectCardPhoto,
      mockProjectMilestones
    );

    await expect(project).toEqual(savedProject);
  });
});

// method out of use
describe.skip('Testing projectService readProject', () => {
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
    expect(project).toEqual(mockProject);
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
