const { assert } = require('chai');
const _ = require('lodash');

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
      cardPhoto: `${__dirname}/mockFiles/projectCardPhoto.png`,
      coverPhoto: `${__dirname}/mockFiles/projectCoverPhoto.png`,
      pitchProposal: `${__dirname}/mockFiles/projectProposal.pdf`,
      milestonesFile: `${__dirname}/mockFiles/projectMilestones.xlsx`,
      id: 1
    };

    const pathMilestonesXls = require('path').join(
      __dirname,
      './mockFiles/projectMilestones.xlsx'
    );

    const dataMilestones = await readFile(pathMilestonesXls);

    const mockProjectCoverPhoto = {
      name: 'projectCoverPhoto.png',
      path: `${__dirname}/mockFiles/projectCoverPhoto.png`,
      mv: jest.fn()
    };

    const mockProjectCardPhoto = {
      name: 'projectCardPhoto.png',
      path: `${__dirname}/mockFiles/projectCardPhoto.png`,
      mv: jest.fn()
    };

    const mockProjectProposal = {
      name: 'projectProposal.pdf',
      path: `${__dirname}/mockFiles/projectProposal.pdf`,
      mv: jest.fn()
    };

    const mockProjectMilestones = {
      name: 'projectMilestones.xlsx',
      path: `${__dirname}/mockFiles/projectMilestones.xlsx`,
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
      ownerId: 1,
      timeframe: 'Project Timeframe',
      cardPhoto: `${__dirname}/mockFiles/projectCardPhoto.png`,
      coverPhoto: `${__dirname}/mockFiles/projectCoverPhoto.png`,
      pitchProposal: `${__dirname}/mockFiles/projectPitchProposal.pdf`,
      milestonesFile: `${__dirname}/mockFiles/projectMilestones.xlsx`,
      status: 1,
      createdAt: '2019-03-13T03:00:00.000Z',
      updatedAt: '2019-03-13T03:00:00.000Z',
      id: 1
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
                cardPhoto: `${__dirname}/mockFiles/projectCardPhoto.png`,
                coverPhoto: `${__dirname}/mockFiles/projectCoverPhoto.png`,
                pitchProposal: `${__dirname}/mockFiles/projectPitchProposal.pdf`,
                milestonesFile: `${__dirname}/mockFiles/projectMilestones.xlsx`,
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
                cardPhoto: `${__dirname}/mockFiles/projectCardPhoto.png`,
                coverPhoto: `${__dirname}/mockFiles/projectCoverPhoto.png`,
                pitchProposal: `${__dirname}/mockFiles/projectPitchProposal.pdf`,
                milestonesFile: `${__dirname}/mockFiles/projectMilestones.xlsx`,
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
                cardPhoto: `${__dirname}/mockFiles/projectCardPhoto.png`,
                coverPhoto: `${__dirname}/mockFiles/projectCoverPhoto.png`,
                pitchProposal: `${__dirname}/mockFiles/projectPitchProposal.pdf`,
                milestonesFile: `${__dirname}/mockFiles/projectMilestones.xlsx`,
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
              projectName: 'name',
              mission: 'mision',
              problemAddressed: 'problem',
              ownerId: 1,
              location: 'location',
              timeframe: '10/10/2019',
              cardPhoto: `${__dirname}/mockFiles/projectCardPhoto.png`,
              coverPhoto: `${__dirname}/mockFiles/projectCoverPhoto.png`,
              pitchProposal: `${__dirname}/mockFiles/projectPitchProposal.pdf`,
              milestonesFile: `${__dirname}/mockFiles/projectMilestones.xlsx`,
              status: 1,
              createdAt: '2019-03-13T03:00:00.000Z',
              updatedAt: '2019-03-13T03:00:00.000Z',
              id: 1
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
    cardPhoto: `${__dirname}/mockFiles/projectCardPhoto.png`,
    coverPhoto: `${__dirname}/mockFiles/projectCoverPhoto.png`,
    pitchProposal: `${__dirname}/mockFiles/projectPitchProposal.pdf`,
    milestonesFile: `${__dirname}/mockFiles/projectMilestones.xlsx`,
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
  });
});

describe('Testing projectService get milestones', () => {
  let projectDao;
  let projectService;
  const mockMilestones = [
    {
      tasks: 'tasks',
      impact: 'impact',
      impactCriterion: 'criterion',
      signsOfSuccess: 'success',
      signsOfSuccessCriterion: 'successcriterion',
      category: 'category',
      keyPersonnel: 'key',
      budget: 'budget',
      quarter: '1',
      id: 1,
      project: 1
    },
    {
      tasks: 'task2',
      impact: 'omṕacet2',
      impactCriterion: 'crit2',
      signsOfSuccess: 'succ2',
      signsOfSuccessCriterion: 'sicccrit2',
      category: 'cat2',
      keyPersonnel: 'key2',
      budget: 'budget2',
      quarter: '2',
      id: 2,
      project: 1
    }
  ];
  beforeEach(() => {
    projectDao = {
      async getProjectMilestones({ projectId }) {
        if (projectId === 1) return mockMilestones;
        return [];
      }
    };
    projectService = require('../rest/core/projectService')({
      fastify,
      projectDao
    });
  });
  it('Request milestones to existent project must return a list of milestones', async () => {
    const milestones = await projectService.getProjectMilestones({
      projectId: 1
    });
    expect(milestones).toBe(mockMilestones);
  });
  it('Request milestones to non-existent project or project without milestones must return empty list ', async () => {
    const milestones = await projectService.getProjectMilestones({
      projectId: -1
    });
    expect(milestones).toEqual([]);
  });
});

describe('Testing projectService updateProject', () => {
  let projectDao;
  let projectService;
  let milestoneService;
  let projectStatusDao;

  const projectId = 15;

  const mockProject = {
    projectName: 'UDEW',
    mission: 'UDEW Mission',
    problemAddressed: 'UDEW Problem',
    location: 'UDEW Location',
    timeframe: '10 months',
    goalAmount: 928,
    faqLink: 'http://www.atixlabs.com/',
    id: projectId,
    ownerId: 1
  };

  beforeAll(() => {
    projectStatusDao = {};

    projectDao = {
      async updateProject(project, id) {
        if (id === '') {
          throw Error('Error updating project');
        }
        if (id === 0) {
          return undefined;
        }
        return project;
      }
    };

    milestoneService = {};

    projectService = require('../rest/core/projectService')({
      fastify,
      projectDao,
      milestoneService,
      projectStatusDao
    });
  });

  it('should return the updated project', async () => {
    const expected = mockProject;

    const response = await projectService.updateProject(mockProject, projectId);

    return expect(response).toEqual(expected);
  });

  it('should return an error if the project does not exist', async () => {
    const expected = {
      status: 404,
      error: 'Project does not exist'
    };

    const response = await projectService.updateProject(mockProject, 0);

    return expect(response).toEqual(expected);
  });

  it('should return an error if the project could not be updated', async () => {
    const expected = { status: 500, error: 'Error updating Project' };

    const response = await projectService.updateProject(mockProject, '');

    return expect(response).toEqual(expected);
  });
});
