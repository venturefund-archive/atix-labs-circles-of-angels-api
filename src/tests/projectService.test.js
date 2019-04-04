const _ = require('lodash');
const mkdirp = require('mkdirp-promise');
const fs = require('fs');
const { promisify } = require('util');
const { addPathToFilesProperties } = require('../rest/util/files');
const configs = require('../../config/configs');
const { getBase64htmlFromPath } = require('../rest/util/images');

const readFile = promisify(fs.readFile);

const fastify = { log: { info: console.log, error: console.log } };

describe('Testing projectService createProject', () => {
  let projectDao;
  let projectService;
  let milestoneService;
  let projectStatusDao;

  beforeAll(() => {
    projectStatusDao = {};

    projectDao = {
      async saveProject(project) {
        if (!project.mission) {
          throw Error('error saving project');
        }
        const toSave = Object.assign({}, project, { id: 1 });
        return toSave;
      }
    };

    milestoneService = {
      async createMilestones() {
        return [];
      }
    };

    projectService = require('../rest/core/projectService')({
      fastify,
      projectDao,
      milestoneService,
      projectStatusDao
    });

    jest.mock('mkdirp-promise');
  });

  it(
    'should create and return a new project with ' +
      'status 0 and ownerId from a JSON object',
    async () => {
      const ownerId = 1;
      const projectName = 'Project Name';

      const mockProject = JSON.stringify({
        projectName,
        mission: 'Project Mission',
        problemAddressed: 'Problem',
        location: 'Location',
        timeframe: 'Project Timeframe',
        goalAmount: 9000,
        faqLink: 'http://www.google.com/'
      });

      const savedProject = {
        projectName,
        mission: 'Project Mission',
        problemAddressed: 'Problem',
        location: 'Location',
        timeframe: 'Project Timeframe',
        goalAmount: 9000,
        faqLink: 'http://www.google.com/',
        ownerId,
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

      console.log(pathMilestonesXls);

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
        mockProjectMilestones,
        ownerId
      );

      const response = {
        project: savedProject,
        milestones: []
      };

      await expect(project).toEqual(response);
    }
  );

  it('should throw an error if it fails to save the project', async () => {
    const ownerId = 1;
    const projectName = 'Project Name';

    const mockProject = JSON.stringify({
      projectName,
      problemAddressed: 'Problem',
      location: 'Location',
      timeframe: 'Project Timeframe',
      goalAmount: 9000,
      faqLink: 'http://www.google.com/'
    });

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

    addPathToFilesProperties(
      projectName,
      mockProjectCoverPhoto,
      mockProjectCardPhoto,
      mockProjectProposal,
      mockProjectMilestones
    );

    await expect(
      projectService.createProject(
        mockProject,
        mockProjectProposal,
        mockProjectCoverPhoto,
        mockProjectCardPhoto,
        mockProjectMilestones,
        ownerId
      )
    ).rejects.toEqual(Error('Error creating Project'));
  });
});

describe('Testing projectService getProjectList', () => {
  let projectDao;
  let projectService;
  let projectStatusDao;
  let milestoneService;

  beforeAll(() => {
    projectStatusDao = {};

    projectDao = {
      async getProjecListWithStatusFrom({ status }) {
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
            pitchProposal: `${__dirname}/mockFiles/projectProposal.pdf`,
            milestonesFile: `${__dirname}/mockFiles/projectMilestones.xlsx`,
            status,
            createdAt: '2019-03-13T03:00:00.000Z',
            updatedAt: '2019-03-13T03:00:00.000Z',
            id: 1
          }
        ];
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

  it('should return an array of all projects with status >= -1', async () => {
    const status = -1;

    const mockProjects = [
      {
        projectName: 'name',
        mission: 'mision',
        problemAddressed: 'problem',
        ownerId: 1,
        location: 'location',
        timeframe: '10/10/2019',
        cardPhoto: getBase64htmlFromPath(
          `${__dirname}/mockFiles/projectCardPhoto.png`
        ),
        coverPhoto: getBase64htmlFromPath(
          `${__dirname}/mockFiles/projectCoverPhoto.png`
        ),
        pitchProposal: `${__dirname}/mockFiles/projectProposal.pdf`,
        milestonesFile: `${__dirname}/mockFiles/projectMilestones.xlsx`,
        status,
        createdAt: '2019-03-13T03:00:00.000Z',
        updatedAt: '2019-03-13T03:00:00.000Z',
        id: 1
      }
    ];

    const projects = await projectService.getProjectList();

    expect(projects).toEqual(mockProjects);
  });
});

describe('Testing projectService getActiveProjectList', () => {
  let projectDao;
  let projectService;
  let projectStatusDao;
  let milestoneService;

  beforeAll(() => {
    projectStatusDao = {};

    projectDao = {
      async getProjecListWithStatusFrom({ status }) {
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
            pitchProposal: `${__dirname}/mockFiles/projectProposal.pdf`,
            milestonesFile: `${__dirname}/mockFiles/projectMilestones.xlsx`,
            status,
            createdAt: '2019-03-13T03:00:00.000Z',
            updatedAt: '2019-03-13T03:00:00.000Z',
            id: 1
          }
        ];
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

  it('should return an array of all projects with status == 1', async () => {
    const status = 1;

    const mockProjects = [
      {
        projectName: 'name',
        mission: 'mision',
        problemAddressed: 'problem',
        ownerId: 1,
        location: 'location',
        timeframe: '10/10/2019',
        cardPhoto: getBase64htmlFromPath(
          `${__dirname}/mockFiles/projectCardPhoto.png`
        ),
        coverPhoto: getBase64htmlFromPath(
          `${__dirname}/mockFiles/projectCoverPhoto.png`
        ),
        pitchProposal: `${__dirname}/mockFiles/projectProposal.pdf`,
        milestonesFile: `${__dirname}/mockFiles/projectMilestones.xlsx`,
        status,
        createdAt: '2019-03-13T03:00:00.000Z',
        updatedAt: '2019-03-13T03:00:00.000Z',
        id: 1
      }
    ];

    const projects = await projectService.getActiveProjectList();

    expect(projects).toEqual(mockProjects);
  });
});

describe('Testing projectService getProjectWithId', () => {
  let projectDao;
  let projectService;
  let projectStatusDao;
  let milestoneService;

  beforeAll(() => {
    projectStatusDao = {};
    milestoneService = {};
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
              id: projectId
            };
          default:
            return null;
        }
      }
    };
    projectService = require('../rest/core/projectService')({
      fastify,
      projectDao,
      milestoneService,
      projectStatusDao
    });
  });
  it('should return a project with id == 1 project if exists', async () => {
    const project = await projectService.getProjectWithId({ projectId: 1 });
    expect(project.id).toBe(1);
  });

  // eslint-disable-next-line prettier/prettier
  it('should return null if project doesn\'t exist', async () => {
    const project = await projectService.getProjectWithId({ projectId: 2 });
    expect(project).toBe(null);
  });
});

describe('Testing projectService updateProjectStatus', () => {
  let projectDao;
  let projectService;
  let projectStatusDao;
  let milestoneService;

  beforeAll(() => {
    projectStatusDao = {
      async existStatus({ status }) {
        if (status > -2 && status < 2) {
          return true;
        }

        return false;
      }
    };
    milestoneService = {};
    projectDao = {
      async updateProjectStatus({ projectId, status }) {
        return {
          projectName: 'name',
          mission: 'mission',
          problemAddressed: 'problem',
          location: 'location',
          timeframe: 'time',
          faqLink: 'http://www.google.com',
          cardPhoto: `${__dirname}/mockFiles/projectCardPhoto.png`,
          coverPhoto: `${__dirname}/mockFiles/projectCoverPhoto.png`,
          pitchProposal: `${__dirname}/mockFiles/projectProposal.pdf`,
          milestonesFile: `${__dirname}/mockFiles/projectMilestones.xlsx`,
          goalAmount: 111,
          status,
          ownerId: 1,
          projectAgreement: '',
          createdAt: '2019-03-25T03:00:00.000Z',
          updatedAt: '2019-03-28T03:00:00.000Z',
          id: projectId
        };
      }
    };

    projectService = require('../rest/core/projectService')({
      fastify,
      projectDao,
      milestoneService,
      projectStatusDao
    });
  });

  it('should return the updated project', async () => {
    const projectId = 1;
    const status = 1;

    const updatedProject = await projectService.updateProjectStatus({
      projectId,
      status
    });

    await expect(updatedProject.id).toBe(projectId);
    await expect(updatedProject.status).toBe(status);
  });

  // eslint-disable-next-line prettier/prettier
  it('should return undefined if the projectStatus doesn\'t exist', async () => {
    const projectId = 1;
    const status = 3;

    const updatedProject = await projectService.updateProjectStatus({
      projectId,
      status
    });

    await expect(updatedProject).toBeUndefined();
  });
});

describe('Testing projectService deleteProject', () => {
  let projectDao;
  let projectService;
  let projectModel;

  const mockProject = {
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

  it('should return deleted project if exists', async () => {
    let deletedProject = await projectService.deleteProject({ projectId: 1 });
    expect(deletedProject).toBe(mockProject);

    deletedProject = await projectService.deleteProject({ projectId: 1 });
    expect(deletedProject).toBeUndefined();
  });

  // eslint-disable-next-line prettier/prettier
  it('should return undefined if the project doesn\'t exist', async () => {
    deletedProject = await projectService.deleteProject({ projectId: -1 });
    expect(deletedProject).toBeUndefined();
  });
});

describe('Testing projectService getProjectMilestones', () => {
  let projectDao;
  let projectService;
  let projectStatusDao;
  let milestoneService;

  beforeEach(() => {
    projectStatusDao = {};
    milestoneService = {
      async getMilestoneActivities(milestone) {
        const activities = [
          {
            tasks: 'tasks A',
            impact: 'impact A',
            impactCriterion: 'criterion A',
            signsOfSuccess: 'success A',
            signsOfSuccessCriterion: 'successcriterion A',
            category: 'category A',
            keyPersonnel: 'key A',
            budget: 'budget A',
            quarter: milestone.quarter,
            type: 'Activity',
            id: 1,
            milestone: milestone.id
          }
        ];

        const milestoneWithActivities = {
          ...milestone,
          activities
        };

        return milestoneWithActivities;
      }
    };

    projectDao = {
      async getProjectMilestones({ projectId }) {
        if (projectId === 1) {
          return [
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
              project: projectId
            },
            {
              tasks: 'task2',
              impact: 'impact2',
              impactCriterion: 'crit2',
              signsOfSuccess: 'succ2',
              signsOfSuccessCriterion: 'sicccrit2',
              category: 'cat2',
              keyPersonnel: 'key2',
              budget: 'budget2',
              quarter: '2',
              id: 2,
              project: projectId
            }
          ];
        }
        return [];
      }
    };

    projectService = require('../rest/core/projectService')({
      fastify,
      projectDao,
      milestoneService,
      projectStatusDao
    });
  });

  it('should return a list of milestones with activities for an existing project', async () => {
    const projectId = 1;

    const mockMilestonesWithActivities = [
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
        project: projectId,
        type: 'Milestone',
        activities: [
          {
            tasks: 'tasks A',
            impact: 'impact A',
            impactCriterion: 'criterion A',
            signsOfSuccess: 'success A',
            signsOfSuccessCriterion: 'successcriterion A',
            category: 'category A',
            keyPersonnel: 'key A',
            budget: 'budget A',
            quarter: '1',
            type: 'Activity',
            id: 1,
            milestone: 1
          }
        ]
      },
      {
        tasks: 'task2',
        impact: 'impact2',
        impactCriterion: 'crit2',
        signsOfSuccess: 'succ2',
        signsOfSuccessCriterion: 'sicccrit2',
        category: 'cat2',
        keyPersonnel: 'key2',
        budget: 'budget2',
        quarter: '2',
        id: 2,
        project: projectId,
        type: 'Milestone',
        activities: [
          {
            tasks: 'tasks A',
            impact: 'impact A',
            impactCriterion: 'criterion A',
            signsOfSuccess: 'success A',
            signsOfSuccessCriterion: 'successcriterion A',
            category: 'category A',
            keyPersonnel: 'key A',
            budget: 'budget A',
            quarter: '2',
            type: 'Activity',
            id: 1,
            milestone: 2
          }
        ]
      }
    ];

    const milestones = await projectService.getProjectMilestones({
      projectId
    });

    await expect(milestones).toEqual(mockMilestonesWithActivities);
  });

  it('should return an empty array for a non-existent project', async () => {
    const milestones = await projectService.getProjectMilestones({
      projectId: -1
    });

    await expect(milestones).toEqual([]);
  });
});

describe('Testing projectService downloadMilestonesTemplate', () => {
  let projectDao;
  let projectService;
  let milestoneService;
  let projectStatusDao;

  const filepath = require('path').join(
    __dirname,
    './mockFiles/projectXls.xlsx'
  );

  const mockReadStream = fs.createReadStream(filepath);

  beforeAll(() => {
    projectStatusDao = {};
    projectDao = {};
    milestoneService = {};

    projectService = require('../rest/core/projectService')({
      fastify,
      projectDao,
      milestoneService,
      projectStatusDao
    });

    fs.existsSync = jest.fn();
    fs.createReadStream = jest.fn();
  });

  it('should return a file ReadStream', async () => {
    fs.existsSync.mockReturnValueOnce(true);
    fs.createReadStream.mockReturnValueOnce(mockReadStream);

    const response = await projectService.downloadMilestonesTemplate();

    await expect(response).toEqual(mockReadStream);
  });

  it('should return an error if the file could not be read', async () => {
    fs.existsSync.mockReturnValueOnce(true);

    // fs.createReadStream = jest.fn() throws an error

    const mockError = {
      error: 'ERROR: Error reading milestones template file',
      status: 404
    };
    const response = await projectService.downloadMilestonesTemplate();

    await expect(response).toEqual(mockError);
  });

  // eslint-disable-next-line prettier/prettier
  it('should return an error if the file doesn\'t exist', async () => {
    fs.existsSync.mockReturnValueOnce(false);

    const mockError = {
      error: 'ERROR: Milestones template file could not be found',
      status: 404
    };
    const response = await projectService.downloadMilestonesTemplate();

    await expect(response).toEqual(mockError);
  });
});

describe('Testing projectService getProjectMilestonesPath', () => {
  let projectDao;
  let projectService;
  let milestoneService;
  let projectStatusDao;
  const projectId = 1;
  const filepath = '/server/file/milestones.xlsx';

  beforeAll(() => {
    projectStatusDao = {};
    projectDao = {
      getProjectMilestonesFilePath: id => {
        if (id === projectId) {
          return {
            milestonesFile: filepath,
            id: projectId
          };
        }
        return undefined;
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

  it('should return a path to the milestones file of a project', async () => {
    const milestonesPath = await projectService.getProjectMilestonesPath(
      projectId
    );

    await expect(milestonesPath).toEqual(filepath);
  });

  // eslint-disable-next-line prettier/prettier
  it('should throw an error if the project doesn\'t exist', async () => {
    const missingProject = projectId + 1;

    await expect(
      projectService.getProjectMilestonesPath(missingProject)
    ).rejects.toEqual(Error('Error getting milestones file'));
  });
});

describe('Testing projectService uploadAgreement', () => {
  let projectDao;
  let projectService;
  let milestoneService;
  let projectStatusDao;

  const id = 1;
  const name = 'Project';

  const mockProjectAgreement = {
    name: 'projectAgreement.pdf',
    path: `${__dirname}/mockFiles/projectProposal.pdf`,
    mv: jest.fn()
  };

  beforeAll(() => {
    projectStatusDao = {};
    projectDao = {
      getProjectById: ({ projectId }) => {
        if (projectId === 0) {
          return undefined;
        }

        return {
          projectName: name,
          id: projectId
        };
      },

      updateProjectAgreement: ({ projectAgreement, projectId }) => {
        if (projectId === '') {
          throw Error('Error updating project agreement');
        }

        return {
          id: projectId,
          projectName: name,
          projectAgreement
        };
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

  it('should return the updated project with the agreement file path', async () => {
    const expected = {
      projectName: 'Project',
      id: 1,
      projectAgreement: `/home/atixlabs/files/server/projects/${name}/agreement.pdf`
    };

    const updatedProject = await projectService.uploadAgreement(
      mockProjectAgreement,
      id
    );

    return expect(updatedProject).toEqual(expected);
  });

  it('should return an error if the project does not exist', async () => {
    const expected = { error: 'ERROR: Project not found', status: 404 };

    const updatedProject = await projectService.uploadAgreement(
      mockProjectAgreement,
      0
    );

    return expect(updatedProject).toEqual(expected);
  });

  it('should return an error if the agreement could not be uploaded', async () => {
    return expect(
      projectService.uploadAgreement(mockProjectAgreement, '')
    ).rejects.toEqual(Error('Error uploading agreement'));
  });
});

describe('Testing projectService downloadAgreement', () => {
  let projectDao;
  let projectService;
  let milestoneService;
  let projectStatusDao;

  const id = 1;

  const filepath = require('path').join(
    __dirname,
    './mockFiles/projectProposal.pdf'
  );

  const mockReadStream = fs.createReadStream(filepath);

  beforeAll(() => {
    projectStatusDao = {};
    projectDao = {
      getProjectById: ({ projectId }) => {
        if (projectId === 0) {
          return undefined;
        }

        if (projectId === 999) {
          return {
            id: projectId
          };
        }

        return {
          projectAgreement: filepath,
          id: projectId
        };
      }
    };

    milestoneService = {};

    projectService = require('../rest/core/projectService')({
      fastify,
      projectDao,
      milestoneService,
      projectStatusDao
    });

    fs.createReadStream = jest.fn();
  });

  it('should return a file ReadStream', async () => {
    fs.createReadStream.mockReturnValueOnce(mockReadStream);

    const response = await projectService.downloadAgreement(id);

    return expect(response).toEqual(mockReadStream);
  });

  it('should throw an error if the file could not be read', async () => {
    // fs.createReadStream = jest.fn() throws an error

    return expect(projectService.downloadAgreement(id)).rejects.toEqual(
      Error('Error getting agreement')
    );
  });

  it('should return an error if the project does not exist', async () => {
    const mockError = { error: 'ERROR: Project not found', status: 404 };
    const response = await projectService.downloadAgreement(0);

    return expect(response).toEqual(mockError);
  });

  it('should return an error if the project does not have an agreement', async () => {
    const mockError = {
      // eslint-disable-next-line prettier/prettier
      error: 'ERROR: Project doesn\'t have an agreement uploaded',
      status: 409
    };

    const response = await projectService.downloadAgreement(999);

    return expect(response).toEqual(mockError);
  });
});

describe('Testing projectService downloadProposal', () => {
  let projectDao;
  let projectService;
  let milestoneService;
  let projectStatusDao;

  const id = 1;

  const filepath = require('path').join(
    __dirname,
    './mockFiles/projectProposal.pdf'
  );

  const mockReadStream = fs.createReadStream(filepath);

  beforeAll(() => {
    projectStatusDao = {};
    projectDao = {
      getProjectById: ({ projectId }) => {
        if (projectId === 0) {
          return undefined;
        }

        if (projectId === 999) {
          return {
            id: projectId
          };
        }

        return {
          pitchProposal: filepath,
          id: projectId
        };
      }
    };

    milestoneService = {};

    projectService = require('../rest/core/projectService')({
      fastify,
      projectDao,
      milestoneService,
      projectStatusDao
    });

    fs.createReadStream = jest.fn();
  });

  it('should return a file ReadStream', async () => {
    fs.createReadStream.mockReturnValueOnce(mockReadStream);

    const response = await projectService.downloadProposal(id);

    return expect(response).toEqual(mockReadStream);
  });

  it('should throw an error if the file could not be read', async () => {
    // fs.createReadStream = jest.fn() throws an error

    return expect(projectService.downloadProposal(id)).rejects.toEqual(
      Error('Error getting pitch proposal')
    );
  });

  it('should return an error if the project does not exist', async () => {
    const mockError = { error: 'ERROR: Project not found', status: 404 };
    const response = await projectService.downloadProposal(0);

    return expect(response).toEqual(mockError);
  });

  it('should return an error if the project does not have an proposal', async () => {
    const mockError = {
      // eslint-disable-next-line prettier/prettier
      error: 'ERROR: Project doesn\'t have a pitch proposal uploaded',
      status: 409
    };

    const response = await projectService.downloadProposal(999);

    return expect(response).toEqual(mockError);
  });
});
