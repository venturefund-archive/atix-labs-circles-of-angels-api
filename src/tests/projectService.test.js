const _ = require('lodash');
const fs = require('fs');
const { promisify } = require('util');
const { addPathToFilesProperties } = require('../rest/util/files');
const configs = require('../../config/configs');
const projectServiceBuilder = require('../rest/core/projectService');
const { projectStatus } = require('../rest/util/constants');

const readFile = promisify(fs.readFile);

const fastify = {
  log: { info: console.log, error: console.log },
  eth: {
    createProject: () =>
      '0x0d8cd6fd460d607b2590fb171a3dff04e33285830add91a2f9a4e43ced1ed01a',
    isTransactionConfirmed: creationTransactionHash =>
      !!creationTransactionHash,
    startProject: () =>
      '0x0d8cd6fd460d607b2590fb171a3dff04e33285830add91a2f9a4e43ced1ed01a'
  }
};

describe('Testing projectService createProject', () => {
  let projectDao;
  let photoService;
  let projectService;
  let milestoneService;
  let projectStatusDao;
  let userDao;

  beforeAll(() => {
    projectStatusDao = {};

    projectDao = {
      async saveProject(project) {
        if (!project.mission) {
          throw Error('error saving project');
        }
        const toSave = Object.assign({}, project, { id: 1 });
        return toSave;
      },

      async updateProject(project) {
        return project;
      }
    };

    userDao = {
      async getUserById(owner) {
        return {
          id: owner,
          username: 'Social Entrepreneur'
        };
      }
    };

    milestoneService = {
      async createMilestones() {
        return [];
      }
    };

    photoService = {
      async savePhoto(path) {
        const photo = {
          id: 1,
          path
        };
        return photo;
      }
    };

    projectService = projectServiceBuilder({
      fastify,
      projectDao,
      milestoneService,
      projectStatusDao,
      userDao,
      photoService
    });

    jest.mock('mkdirp-promise');
  });

  it(
    'should create and return a new project with ' +
      'status 0 and ownerId from a JSON object',
    async () => {
      const ownerId = 1;
      const projectName = 'Project Name';
      const projectId = 1;

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
        cardPhoto: 1,
        coverPhoto: 1,
        pitchProposal: `${
          configs.fileServer.filePath
        }/projects/${projectId}/pitchProposal.pdf`,
        milestonesFile: `${
          configs.fileServer.filePath
        }/projects/${projectId}/milestones.xlsx`,
        projectAgreement: `${
          configs.fileServer.filePath
        }/projects/${projectId}/agreement.pdf`,
        id: projectId,
        creationTransactionHash:
          '0x0d8cd6fd460d607b2590fb171a3dff04e33285830add91a2f9a4e43ced1ed01a'
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

      const mockProjectAgreement = {
        name: 'projectAgreement.pdf',
        path: `${__dirname}/mockFiles/projectProposal.pdf`,
        mv: jest.fn()
      };

      const response = await projectService.createProject(
        mockProject,
        mockProjectProposal,
        mockProjectCoverPhoto,
        mockProjectCardPhoto,
        mockProjectMilestones,
        mockProjectAgreement,
        ownerId
      );

      const expected = {
        project: savedProject,
        milestones: []
      };

      await expect(response).toEqual(expected);
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

    const mockProjectAgreement = {
      name: 'projectAgreement.pdf',
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
      mockProjectMilestones,
      mockProjectAgreement
    );

    await expect(
      projectService.createProject(
        mockProject,
        mockProjectProposal,
        mockProjectCoverPhoto,
        mockProjectCardPhoto,
        mockProjectMilestones,
        mockProjectAgreement,
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

  const cardPhoto = 1;
  const coverPhoto = 2;

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
            cardPhoto,
            coverPhoto,
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

    projectService = projectServiceBuilder({
      fastify,
      projectDao,
      milestoneService,
      projectStatusDao
    });
  });

  it('should return an array of all projects with status >= PENDING_APPROVAL', async () => {
    const status = projectStatus.PENDING_APPROVAL;

    const mockProjects = [
      {
        projectName: 'name',
        mission: 'mision',
        problemAddressed: 'problem',
        ownerId: 1,
        location: 'location',
        timeframe: '10/10/2019',
        cardPhoto,
        coverPhoto,
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

  const cardPhoto = 1;
  const coverPhoto = 2;

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
            cardPhoto,
            coverPhoto,
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

    projectService = projectServiceBuilder({
      fastify,
      projectDao,
      milestoneService,
      projectStatusDao
    });
  });

  it('should return an array of all projects with status PUBLISHED', async () => {
    const status = projectStatus.PUBLISHED;

    const mockProjects = [
      {
        projectName: 'name',
        mission: 'mision',
        problemAddressed: 'problem',
        ownerId: 1,
        location: 'location',
        timeframe: '10/10/2019',
        cardPhoto,
        coverPhoto,
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

  const cardPhoto = 1;
  const coverPhoto = 2;

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
              cardPhoto,
              coverPhoto,
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
    projectService = projectServiceBuilder({
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

  beforeAll(() => {
    projectStatusDao = {
      async existStatus({ status }) {
        if (status > -2 && status < 2) {
          return true;
        }

        return false;
      }
    };
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

    projectService = projectServiceBuilder({
      fastify,
      projectDao,
      projectStatusDao
    });

    projectService.getProjectWithId = async projectId => {
      return {
        id: projectId,
        projectName: 'Project',
        creationTransactionHash:
          '0x0d8cd6fd460d607b2590fb171a3dff04e33285830add91a2f9a4e43ced1ed01a'
      };
    };
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
        const project = _.find(this.projects, element => element.id === id);
        _.remove(this.projects, element => element.id === id);
        return {
          fetch: () => project
        };
      }
    };
    projectDao = require('../rest/dao/projectDao')({ projectModel });
    projectService = projectServiceBuilder({
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

    projectService = projectServiceBuilder({
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

    const milestones = await projectService.getProjectMilestones(projectId);

    await expect(milestones).toEqual(mockMilestonesWithActivities);
  });

  it('should return an empty array for a non-existent project', async () => {
    const milestones = await projectService.getProjectMilestones(-1);

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

    projectService = projectServiceBuilder({
      fastify,
      projectDao,
      milestoneService,
      projectStatusDao
    });

    fs.existsSync = jest.fn();
    fs.createReadStream = jest.fn();
  });

  it('should return an object with a filestream and the file name', async () => {
    fs.existsSync.mockReturnValueOnce(true);
    fs.createReadStream.mockReturnValueOnce(mockReadStream);

    const expected = {
      filename: 'milestones.xlsx',
      filestream: mockReadStream
    };

    const response = await projectService.downloadMilestonesTemplate();

    await expect(response).toEqual(expected);
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

    projectService = projectServiceBuilder({
      fastify,
      projectDao,
      milestoneService,
      projectStatusDao
    });
  });

  it(
    'should return  an object with the file name and ' +
      ' the path to the milestones file of a project',
    async () => {
      const milestonesPath = await projectService.getProjectMilestonesPath(
        projectId
      );

      const expected = {
        filename: 'milestones.xlsx',
        filepath
      };

      await expect(milestonesPath).toEqual(expected);
    }
  );

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

    projectService = projectServiceBuilder({
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
      projectAgreement: `/home/atixlabs/files/server/projects/${id}/agreement.pdf`
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

  it('should return an error if the agreement could not be uploaded', async () =>
    expect(
      projectService.uploadAgreement(mockProjectAgreement, '')
    ).rejects.toEqual(Error('Error uploading agreement')));
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

    projectService = projectServiceBuilder({
      fastify,
      projectDao,
      milestoneService,
      projectStatusDao
    });

    fs.createReadStream = jest.fn();
  });

  it('should return an object with the filename and filestream', async () => {
    fs.createReadStream.mockReturnValueOnce(mockReadStream);

    const response = await projectService.downloadAgreement(id);

    const expected = {
      filename: 'projectProposal.pdf',
      filestream: mockReadStream
    };

    return expect(response).toEqual(expected);
  });

  it('should throw an error if the file could not be read', async () =>
    // fs.createReadStream = jest.fn() throws an error

    expect(projectService.downloadAgreement(id)).rejects.toEqual(
      Error('Error getting agreement')
    ));

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

    projectService = projectServiceBuilder({
      fastify,
      projectDao,
      milestoneService,
      projectStatusDao
    });

    fs.createReadStream = jest.fn();
  });

  it('should return an object with the filename and filestream', async () => {
    fs.createReadStream.mockReturnValueOnce(mockReadStream);

    const response = await projectService.downloadProposal(id);

    const expected = {
      filename: 'projectProposal.pdf',
      filestream: mockReadStream
    };

    return expect(response).toEqual(expected);
  });

  it('should throw an error if the file could not be read', async () =>
    // fs.createReadStream = jest.fn() throws an error

    expect(projectService.downloadProposal(id)).rejects.toEqual(
      Error('Error getting pitch proposal')
    ));

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

describe('Testing projectService getTotalFunded', () => {
  let projectDao;
  let projectService;
  let transferService;

  const project = 1;

  beforeAll(() => {
    transferService = {
      getTotalFundedByProject: () => 300
    };
    projectDao = {
      getProjectById: ({ projectId }) => {
        if (projectId === 0) {
          return undefined;
        }

        if (!projectId) {
          throw Error('Error getting project from db');
        }

        return {
          id: projectId
        };
      }
    };

    projectService = projectServiceBuilder({
      fastify,
      projectDao,
      transferService
    });
  });

  it('should return the total funded amount for a project', async () => {
    const response = await projectService.getTotalFunded(project);
    const expected = 300;
    return expect(response).toEqual(expected);
  });

  it('should return an error if the project does not exist', async () => {
    const response = await projectService.getTotalFunded(0);
    const expected = { error: 'ERROR: Project not found', status: 404 };
    return expect(response).toEqual(expected);
  });

  it('should throw an error if it fails to get the project', async () =>
    expect(projectService.getTotalFunded()).rejects.toEqual(
      Error('Error getting funded amount')
    ));
});

describe('Testing projectService startProject', () => {
  let projectDao;
  let projectService;
  let transferService;
  let milestoneService;

  const project = 1;
  const goalAmount = 1000;

  beforeAll(() => {
    transferService = {
      getTotalFundedByProject: projectId => {
        if (projectId === 999) {
          return goalAmount - 1;
        }
        return goalAmount;
      }
    };

    milestoneService = {
      startMilestonesOfProject: () => true
    };

    projectDao = {
      getProjectById: ({ projectId }) => {
        if (projectId === 0) {
          return undefined;
        }

        if (projectId === 50) {
          return {
            id: projectId,
            status: projectStatus.REJECTED,
            goalAmount
          };
        }

        if (projectId === 100) {
          return {
            id: projectId,
            status: projectStatus.IN_PROGRESS,
            goalAmount
          };
        }

        if (!projectId) {
          throw Error('Error getting project from db');
        }

        return {
          id: projectId,
          status: projectStatus.PUBLISHED,
          goalAmount
        };
      },

      updateProjectStatusWithTransaction: ({
        projectId,
        status,
        transactionHash
      }) => {
        if (projectId === 500) {
          return undefined;
        }

        return {
          id: projectId,
          status,
          transactionHash
        };
      },

      getUserOwnerOfProject: () => ({
        address: '0xdf08f82de32b8d460adbe8d72043e3a7e25a3b39',
        pwd: '$2a$10$phVS6ulzQvLpjIWE8bkyf.1EXtwcKUD7pgpe0CK7bYkYXmD5Ux2YK'
      })
    };

    projectService = projectServiceBuilder({
      fastify,
      projectDao,
      transferService,
      milestoneService
    });

    projectService.isFullyAssigned = projectId => projectId !== 0;
  });

  it('should return the updated project with status In Progress', async () => {
    const response = await projectService.startProject(project);
    const expected = {
      id: project,
      status: projectStatus.IN_PROGRESS,
      transactionHash:
        '0x0d8cd6fd460d607b2590fb171a3dff04e33285830add91a2f9a4e43ced1ed01a'
    };
    return expect(response).toEqual(expected);
  });

  it('should return an error if the project does not exist', async () => {
    const response = await projectService.startProject(0);
    const expected = { error: 'ERROR: Project not found', status: 404 };
    return expect(response).toEqual(expected);
  });

  it('should return an error if the project is not Published', async () => {
    const response = await projectService.startProject(50);
    const expected = { error: 'Project needs to be published', status: 409 };
    return expect(response).toEqual(expected);
  });

  it('should return an error if the project is already In Progress', async () => {
    const response = await projectService.startProject(100);
    const expected = { error: 'Project has already started', status: 409 };
    return expect(response).toEqual(expected);
  });

  it('should return an error if the project could not be updated', async () => {
    const response = await projectService.startProject(500);
    const expected = {
      error: 'ERROR: Project could not be started',
      status: 500
    };
    return expect(response).toEqual(expected);
  });

  it('should throw an error if it fails to get the project', async () => {
    expect(projectService.startProject()).rejects.toEqual(
      Error('Error starting project')
    );
  });
});

describe('Testing projectService updateProject', () => {
  let projectDao;
  let projectService;
  let photoService;

  beforeAll(() => {
    projectDao = {
      getProjectById: ({ projectId }) => {
        if (projectId === 0) {
          return undefined;
        }

        return {
          id: projectId
        };
      },

      getProjectPhotos: () => ({
        coverPhoto: 1,
        cardPhoto: 2
      }),

      updateProject: (project, id) => {
        if (id === 999) {
          return undefined;
        }

        if (!id) {
          throw Error('Error updating project in db');
        }

        const updatedProject = { ...project, id };
        return updatedProject;
      }
    };

    photoService = {
      getPhotoById: id => ({
        id,
        path: '/server/files/photo.jpg'
      }),
      updatePhoto: id => ({ id })
    };

    projectService = projectServiceBuilder({
      fastify,
      projectDao,
      photoService
    });
  });

  it('should return the updated project', async () => {
    const projectId = 1;
    const project = {
      problemAddressed: 'problem',
      mission: 'mission'
    };

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

    const response = await projectService.updateProject(
      JSON.stringify(project),
      mockProjectCoverPhoto,
      mockProjectCardPhoto,
      projectId
    );

    const expected = {
      ...project,
      id: projectId,
      cardPhoto: 2,
      coverPhoto: 1
    };

    return expect(response).toEqual(expected);
  });

  it('should return a 404 error when the project does not exist', async () => {
    const projectId = 0;
    const project = {
      problemAddressed: 'problem',
      mission: 'mission'
    };

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

    const response = await projectService.updateProject(
      JSON.stringify(project),
      mockProjectCoverPhoto,
      mockProjectCardPhoto,
      projectId
    );

    const expected = {
      status: 404,
      error: 'Project does not exist'
    };

    return expect(response).toEqual(expected);
  });

  it('should return a 404 error when no project could be updated', async () => {
    const projectId = 999;
    const project = {
      problemAddressed: 'problem',
      mission: 'mission'
    };

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

    const response = await projectService.updateProject(
      JSON.stringify(project),
      mockProjectCoverPhoto,
      mockProjectCardPhoto,
      projectId
    );

    const expected = {
      status: 404,
      error: 'Project does not exist'
    };

    return expect(response).toEqual(expected);
  });

  it('should throw an error if it fails to update the project', async () => {
    const project = {
      problemAddressed: 'problem',
      mission: 'mission'
    };

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

    return expect(
      projectService.updateProject(
        JSON.stringify(project),
        mockProjectCoverPhoto,
        mockProjectCardPhoto
      )
    ).rejects.toEqual(Error('Error updating Project'));
  });
});

describe('Testing projectService uploadExperience', () => {
  let projectDao;
  let userDao;
  let projectExperienceDao;
  let photoService;
  let projectService;

  const mockPhotos = [
    {
      name: 'projectCardPhoto.png',
      path: `${__dirname}/mockFiles/projectCardPhoto.png`,
      mv: jest.fn()
    },
    {
      name: 'projectCoverPhoto.png',
      path: `${__dirname}/mockFiles/projectCoverPhoto.png`,
      mv: jest.fn()
    }
  ];

  const photoId = 22;

  beforeAll(() => {
    projectDao = {
      getProjectById: ({ projectId }) => {
        if (projectId === 0) {
          return undefined;
        }

        return {
          id: projectId
        };
      }
    };

    userDao = {
      getUserById: userId => {
        if (userId === 0) {
          return undefined;
        }

        return {
          id: userId
        };
      }
    };

    photoService = {
      savePhoto: filepath => {
        if (filepath.includes('error')) {
          throw Error('Error saving photo');
        }
        return { id: photoId };
      }
    };

    projectExperienceDao = {
      saveProjectExperience: experience => {
        if (experience.user === -1) {
          throw Error('Error saving experience in db');
        }

        if (!experience.comment) {
          return undefined;
        }
        return experience;
      }
    };

    projectService = projectServiceBuilder({
      fastify,
      projectDao,
      photoService,
      userDao,
      projectExperienceDao
    });
  });

  it('should return the saved experience without attached files', async () => {
    const projectId = 12;
    const experience = {
      user: 7,
      comment: 'Testing Comment'
    };

    const response = await projectService.uploadExperience(
      projectId,
      experience
    );

    const expected = {
      ...experience,
      project: projectId
    };

    return expect(response).toEqual(expected);
  });

  it('should return the saved experience with attached files', async () => {
    const projectId = 12;
    const experience = {
      user: 7,
      comment: 'Testing Comment'
    };

    const response = await projectService.uploadExperience(
      projectId,
      experience,
      mockPhotos
    );

    const expected = {
      ...experience,
      project: projectId,
      photos: [{ id: 22 }, { id: 22 }]
    };

    return expect(response).toEqual(expected);
  });

  it('should return an error if the project does not exist', async () => {
    const projectId = 0;
    const experience = {
      user: 7,
      comment: 'Testing Comment'
    };

    const response = await projectService.uploadExperience(
      projectId,
      experience,
      mockPhotos
    );

    const expected = {
      status: 404,
      error: 'Project not found'
    };

    return expect(response).toEqual(expected);
  });

  it('should return an error if the user does not exist', async () => {
    const projectId = 12;
    const experience = {
      user: 0,
      comment: 'Testing Comment'
    };

    const response = await projectService.uploadExperience(
      projectId,
      experience,
      mockPhotos
    );

    const expected = {
      status: 404,
      error: 'User not found'
    };

    return expect(response).toEqual(expected);
  });

  it('should return an error if the file type is not an image', async () => {
    const projectId = 12;
    const experience = {
      user: 7,
      comment: 'Testing Comment'
    };

    const mockFile = [
      {
        name: 'projectProposal.pdf',
        path: `${__dirname}/mockFiles/projectProposal.pdf`,
        mv: jest.fn()
      }
    ];

    const response = await projectService.uploadExperience(
      projectId,
      experience,
      mockFile
    );

    const expected = {
      ...experience,
      project: projectId,
      photos: [{ error: 'File type is invalid', status: 409 }],
      errors: [
        {
          error: 'File type is invalid',
          file: 'projectProposal.pdf'
        }
      ]
    };

    return expect(response).toEqual(expected);
  });

  it('should return an error if it fails to save the file', async () => {
    const projectId = 12;
    const experience = {
      user: 7,
      comment: 'Testing Comment'
    };

    const mockFile = [
      {
        name: 'error.png',
        path: `${__dirname}/mockFiles/error.png`,
        mv: jest.fn()
      }
    ];

    const response = await projectService.uploadExperience(
      projectId,
      experience,
      mockFile
    );

    const expected = {
      ...experience,
      project: projectId,
      photos: [{ error: 'Error saving file', status: 409 }],
      errors: [
        {
          error: 'Error saving file',
          file: 'error.png'
        }
      ]
    };

    return expect(response).toEqual(expected);
  });

  it(
    'should return an error if it fails to save the experience ' +
      'when no file is attached',
    async () => {
      const projectId = 12;
      const experience = {
        user: 7
      };

      const response = await projectService.uploadExperience(
        projectId,
        experience
      );

      const expected = {
        status: 500,
        error: 'There was an error uploading the experience'
      };

      return expect(response).toEqual(expected);
    }
  );

  it('should throw an error it saving the experience in database fails', async () => {
    const projectId = 12;
    const experience = {
      user: -1,
      comment: 'Testing Comment'
    };

    return expect(
      projectService.uploadExperience(projectId, experience)
    ).rejects.toEqual(Error('Error uploading experience'));
  });
});

describe('Testing projectService getExperiences', () => {
  let projectDao;
  let projectExperienceDao;
  let projectService;

  const experiences = projectId => [
    {
      id: 1,
      project: projectId,
      user: {
        id: 1,
        username: 'SE',
        email: 'se@test.com',
        role: 1
      },
      photos: [
        {
          id: 7
        },
        {
          id: 8
        }
      ],
      comment: 'Testing experience'
    },
    {
      id: 2,
      project: projectId,
      user: {
        id: 1,
        username: 'SE',
        email: 'se@test.com',
        role: 1
      },
      photos: [],
      comment: 'Testing experience'
    }
  ];

  beforeAll(() => {
    projectDao = {
      getProjectById: ({ projectId }) => {
        if (!projectId) {
          throw Error('Error getting project from db');
        }
        if (projectId === -1) {
          return undefined;
        }
        return {
          id: projectId
        };
      }
    };

    projectExperienceDao = {
      getExperiencesByProject: projectId => {
        if (projectId === 999) {
          return undefined;
        }
        return { experiences: experiences(projectId) };
      }
    };

    projectService = projectServiceBuilder({
      fastify,
      projectDao,
      projectExperienceDao
    });
  });

  it('should return the experiences of a project', async () => {
    const projectId = 12;

    const response = await projectService.getExperiences(projectId);

    const expected = {
      experiences: experiences(projectId)
    };

    return expect(response).toEqual(expected);
  });

  it('should return an error if the project does not exist', async () => {
    const projectId = -1;

    const response = await projectService.getExperiences(projectId);

    const expected = {
      status: 404,
      error: 'Project not found'
    };

    return expect(response).toEqual(expected);
  });

  it('should return an error if the experiences could not be retrieved', async () => {
    const projectId = 999;

    const response = await projectService.getExperiences(projectId);

    const expected = {
      status: 500,
      error: 'There was an error getting the project experiences'
    };

    return expect(response).toEqual(expected);
  });

  it('should throw an error if the database query fails', async () => {
    return expect(projectService.getExperiences()).rejects.toEqual(
      Error('Error getting experiences')
    );
  });
});
