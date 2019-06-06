const { find } = require('lodash');
const fs = require('fs');
const configs = require('config');
const { promisify } = require('util');

const { addPathToFilesProperties } = require('../rest/util/files');
const projectServiceBuilder = require('../rest/core/projectService');
const { projectStatus, blockchainStatus } = require('../rest/util/constants');

const fastify = {
  log: { info: console.log, error: console.log },
  eth: {
    createProject: () =>
      '0xe2f683a54780cbf79186c8ed692e9df8ae165b9f3f302ab85ffeed2308ce9c75',
    isTransactionConfirmed: creationTransactionHash =>
      !!creationTransactionHash,
    startProject: () =>
      '0x0d8cd6fd460d607b2590fb171a3dff04e33285830add91a2f9a4e43ced1ed01a'
  },
  configs
};

const readFile = promisify(fs.readFile);

const testHelper = require('./testHelper');

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
        if (path.includes('cover')) {
          return{
            id: 1,
            path
          }
        }
        return photo = {
          id: 2,
          path
        };
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

    projectService.configs = {
      fileServer: {
        filePath: `${__dirname}/mockFiles`
      }
    };
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
        path: `${__dirname}/mockFiles/projects/1/pitchProposal.pdf`,
        mv: jest.fn()
      };

      const mockProjectMilestones = {
        name: 'projectMilestones.xlsx',
        path: `${__dirname}/mockFiles/projects/1/milestones.xlsx`,
        mv: jest.fn()
      };

      const mockProjectAgreement = {
        name: 'projectProposal.pdf',
        path: `${__dirname}/mockFiles/projects/1/agreement.pdf`,
        mv: jest.fn()
      };

      let savedProject = testHelper.buildProject(0, 0, {
        id: projectId,
        ownerId,
        projectName,
        pitchProposal: mockProjectProposal.path,
        milestonesFile: mockProjectMilestones.path,
        projectAgreement: mockProjectAgreement.path,
        status: projectStatus.PENDING_APPROVAL,
        blockchainStatus: blockchainStatus.SENT
      });

      delete savedProject.createdAt;
      delete savedProject.updatedAt;
      delete savedProject.transactionHash;
      delete savedProject.ownerName;
      delete savedProject.ownerEmail;
      delete savedProject.milestones;


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
    const projectName = 'Project Name';

    const mockProject = testHelper.buildProject(1, 1, {});
    const ownerId = mockProject.ownerId;

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

  let mockProjects;

  beforeAll(() => {
    projectStatusDao = {};
    mockProjects = testHelper.getMockProjects();
    projectDao = {
      async getProjecListWithStatusFrom({ status }) {
        return mockProjects.filter(project => project.status >= status);
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

    const projects = await projectService.getProjectList();

    expect(projects).toEqual(
      mockProjects.filter(project => project.status >= status)
    );
  });
});

describe('Testing projectService getActiveProjectList', () => {
  let projectDao;
  let projectService;
  let projectStatusDao;
  let milestoneService;

  const cardPhoto = 1;
  const coverPhoto = 2;

  let mockProjects;

  beforeAll(() => {
    projectStatusDao = {};
    mockProjects = testHelper.getMockProjects();
    projectDao = {
      async getProjecListWithStatusFrom({ status }) {
        return mockProjects.filter(project => project.status >= status);
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

    const projects = await projectService.getActiveProjectList();

    expect(projects).toEqual(
      mockProjects.filter(project => project.status >= status)
    );
  });
});

describe('Testing projectService getProjectWithId', () => {
  let projectDao;
  let projectService;
  let projectStatusDao;
  let milestoneService;

  const cardPhoto = 1;
  const coverPhoto = 2;

  let mockProjects;

  beforeAll(() => {
    mockProjects = testHelper.getMockProjects();
    projectStatusDao = {};
    milestoneService = {};
    projectDao = {
      async getProjectById({ projectId }) {
        return find(mockProjects, project => project.id === projectId);
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
  it("should return null if project doesn't exist", async () => {
    const project = await projectService.getProjectWithId({ projectId: -1 });
    expect(project).toBe(undefined);
  });
});

describe('Testing projectService updateProjectStatus', () => {
  let projectDao;
  let projectService;
  let projectStatusDao;

  let mockProjects;

  beforeAll(() => {
    mockProjects = testHelper.getMockProjects();
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
        const project = find(mockProjects, project => project.id === projectId);
        project.status = status;
        return project;
      }
    };

    projectService = projectServiceBuilder({
      fastify,
      projectDao,
      projectStatusDao
    });

    projectService.getProjectWithId = async ({ projectId }) => {
      return find(mockProjects, project => project.id === projectId);
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
  it("should return undefined if the projectStatus doesn't exist", async () => {
    const projectId = 1;
    const status = -1;

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
  let mockProjects;
  beforeAll(() => {
    mockProjects = testHelper.getMockProjects();
  });
  beforeEach(() => {
    projectDao = {
      deleteProject({ projectId }) {
        const project = find(mockProjects, project => project.id === projectId);
        mockProjects = mockProjects.filter(project => project.id !== projectId);
        return project;
      }
    };
    projectService = projectServiceBuilder({
      fastify,
      projectDao
    });
  });

  it('should return deleted project if exists', async () => {
    const deletedProject = await projectService.deleteProject({ projectId: 1 });
    expect(deletedProject.id).toBe(1);

    const undefinedDeletedProject = await projectService.deleteProject({
      projectId: 1
    });
    expect(undefinedDeletedProject).toBeUndefined();
  });

  // eslint-disable-next-line prettier/prettier
  it("should return undefined if the project doesn't exist", async () => {
    deletedProject = await projectService.deleteProject({ projectId: -1 });
    expect(deletedProject).toBeUndefined();
  });
});

describe('Testing projectService getProjectMilestones', () => {
  let projectDao;
  let projectService;
  let projectStatusDao;
  let milestoneService;

  let mockProjects;
  beforeEach(() => {
    mockProjects = testHelper.getMockProjects();
    projectStatusDao = {};
    milestoneService = {
      async getMilestoneActivities(milestone) {
        return milestone;
      }
    };

    projectDao = {
      async getProjectMilestones({ projectId }) {
        const project = find(mockProjects, project => project.id === projectId);
        if (!project) return [];
        return project.milestones;
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
    const milestones = await projectService.getProjectMilestones(projectId);
    expect(milestones.length).toBeGreaterThan(0);
    milestones.forEach(milestone => {
      expect(milestone.activities.length).toBeGreaterThan(0);
    });
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
  it("should return an error if the file doesn't exist", async () => {
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
  it("should throw an error if the project doesn't exist", async () => {
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
      projectAgreement: `${
        configs.fileServer.filePath
      }/projects/${id}/agreement.pdf`
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
      error: "ERROR: Project doesn't have an agreement uploaded",
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
      error: "ERROR: Project doesn't have a pitch proposal uploaded",
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
        if (projectId === undefined) {
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
    const projectId = 1;
    const response = await projectService.getTotalFunded(projectId);
    const expected = 300;
    return expect(response).toEqual(expected);
  });

  it('should return an error if the project does not exist', async () => {
    const response = await projectService.getTotalFunded(0);
    const expected = { error: 'ERROR: Project not found', status: 404 };
    return expect(response).toEqual(expected);
  });
});

describe('Testing projectService startProject', () => {
  let projectDao;
  let projectService;
  let transferService;
  let milestoneService;

  const projId = 1;
  const goalAmount = 1000;

  beforeEach(() => {
    mockProjects = testHelper.getMockProjects();
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
        if (projectId === undefined) throw Error('Error');
        const project = find(mockProjects, project => project.id === projectId);
        return project;
      },

      updateProjectTransaction: ({ projectId, status, transactionHash }) => {
        if (projectId == 5) return undefined;
        const project = find(mockProjects, project => project.id === projectId);
        if (project) {
          project.transactionHash = transactionHash;
          project.status = status;
        }
        return project;
      },

      getUserOwnerOfProject: projectId => {
        const project = find(mockProjects, project => project.id === projectId);
        const user = testHelper.buildUserSe({ id: project.ownerId });
        return user;
      }
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
    const projectId = 4;
    const response = await projectService.startProject(projectId);
    const expected = find(mockProjects, project => projectId == project.id);
    return expect(response).toEqual(expected);
  });

  it('should return an error if the project does not exist', async () => {
    const response = await projectService.startProject(-1);
    const expected = { error: 'ERROR: Project not found', status: 404 };
    return expect(response).toEqual(expected);
  });

  it('should return an error if the project is not Published', async () => {
    const response = await projectService.startProject(2);
    const expected = { error: 'Project needs to be published', status: 409 };
    return expect(response).toEqual(expected);
  });

  it('should return an error if the project is already In Progress', async () => {
    const response = await projectService.startProject(1);
    const expected = { error: 'Project has already started', status: 409 };
    return expect(response).toEqual(expected);
  });

  it.skip('should return an error if the project could not be updated', async () => {
    const response = await projectService.startProject(5);
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
  let mockProjects;
  beforeEach(() => {
    mockProjects = testHelper.getMockProjects();
    projectDao = {
      getProjectById: ({ projectId }) => {
        return find(mockProjects, project => project.id === projectId);
      },

      getProjectPhotos: projectId => {
        const project = find(mockProjects, project => project.id === projectId);
        return {
          cardPhoto: project.cardPhoto,
          coverPhoto: project.coverPhoto
        };
      },

      updateProject: (project, id) => {
        if (id === 5) {
          throw Error('Error updating project in db');
        }
        let updatedProject = find(mockProjects, project => project.id === id);
        if (project) updatedProject = { ...project, id };
        return updatedProject;
      }
    };

    photoService = {
      getPhotoById: id => {
        return testHelper.getPhoto(id);
      },
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
    const projectId = 5;
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
        mockProjectCardPhoto,
        projectId
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
