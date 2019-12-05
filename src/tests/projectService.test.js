const errors = require('../rest/errors/exporter/ErrorExporter');
const COAError = require('../rest/errors/COAError');
const files = require('../rest/util/files');

const { injectMocks } = require('../rest/util/injection');

const projectService = require('../rest/services/projectService');

const userDao = {
  findById: id => {
    if (id === 2) {
      return { id: 2 };
    }
    return undefined;
  }
};

const projectDao = {
  saveProject: project => {
    if (project.projectName === 'validProjectName') {
      return {
        id: 1
      };
    }
    return undefined;
  },
  updateProject: (fields, projectId) => {
    if (projectId === 1) {
      return {
        projectName: 'projectUpdateado',
        ...fields,
        id: projectId
      };
    }
    return undefined;
  },
  findById: id => {
    if (id === 1) {
      return { id: 1 };
    }
    return undefined;
  }
};

describe('Project Service Test', () => {
  beforeAll(() => {
    files.saveFile = jest.fn();
  });

  describe('Update project', () => {
    beforeAll(() => {
      injectMocks(projectService, { projectDao });
    });

    it('Whenever there is no update, an error should be thrown', async () => {
      expect(
        projectService.updateProject(3, {
          field: 'field1',
          field2: 'field2'
        })
      ).rejects.toThrow(COAError);
    });
    it('When an update is done, it should return the id of the updated project', async () => {
      const projectUpdated = await projectService.updateProject(1, {
        field: 'field1',
        field2: 'field2'
      });
      expect(
        projectService.updateProject(1, {
          field: 'field1',
          field2: 'field2'
        })
      ).resolves.not.toThrow(COAError);
      expect(projectUpdated).toEqual(1);
    });
  });

  describe('Update milestone', () => {
    beforeAll(() => {
      const milestoneDao = {
        updateMilestone: (fields, milestoneId) => {
          if (milestoneId === 1) {
            return { id: 1 };
          }
          return undefined;
        }
      };
      injectMocks(projectService, { milestoneDao });
    });
    it('When an update is done, it should return the id of the updated milestone', async () => {
      const projectUpdated = await projectService.updateMilestone(1, {
        field: 'field1',
        field2: 'field2'
      });
      expect(
        projectService.updateMilestone(1, {
          field: 'field1',
          field2: 'field2'
        })
      ).resolves.not.toThrow(COAError);
      expect(projectUpdated).toEqual(1);
    });
    it('Whenever there is no update, an error should be thrown', () => {
      expect(
        projectService.updateMilestone(3, {
          field: 'field1',
          field2: 'field2'
        })
      ).rejects.toThrow(COAError);
    });
  });

  describe('Save project', () => {
    beforeAll(() => {
      injectMocks(projectService, { projectDao });
    });

    it('Whenever a project is saved, it should return the id of the project', async () => {
      const id = await projectService.saveProject({
        projectName: 'validProjectName'
      });
      expect(id).toEqual(1);
    });

    it('Whenever an error occurs and the project cant be saved, an error should be thrown', () => {
      expect(
        projectService.saveProject({ projectName: 'invalidProject' })
      ).rejects.toThrow(COAError);
    });
  });

  describe('CreateProjectThumbnail', () => {
    const projectName = 'validProjectName';
    const countryOfImpact = 'Argentina';
    const timeframe = '12';
    const goalAmount = 124123;
    const ownerId = 2;
    const file = { name: 'project.jpeg', size: 1234 };

    beforeAll(() => {
      injectMocks(projectService, { projectDao, userDao });
    });

    it('Should create a new project when all the fields are valid', async () => {
      const { projectId } = await projectService.createProjectThumbnail({
        projectName,
        countryOfImpact,
        timeframe,
        goalAmount,
        ownerId,
        file
      });
      expect(projectId).toEqual(1);
    });

    it('Should not create a project when some field is missing', async () => {
      expect(
        projectService.createProjectThumbnail({
          projectName,
          countryOfImpact,
          timeframe,
          ownerId
        })
      ).rejects.toThrow(COAError);
    });

    it('Should not create a project when the fileType is not valid', async () => {
      expect(
        projectService.createProjectThumbnail({
          projectName,
          countryOfImpact,
          timeframe,
          goalAmount,
          ownerId,
          file: { name: 'invalidFile.json' }
        })
      ).rejects.toThrow(COAError);
    });

    it('Should not create a project when the owner does not exist', async () => {
      expect(
        projectService.createProjectThumbnail({
          projectName,
          countryOfImpact,
          timeframe,
          goalAmount,
          ownerId: 34,
          file
        })
      ).rejects.toThrow(COAError);
    });

    it('Should not create a project when the file is too big', async () => {
      expect(
        projectService.createProjectThumbnail({
          projectName,
          countryOfImpact,
          timeframe,
          goalAmount,
          ownerId: 34,
          file: { name: 'project.jpeg', size: 123455555 }
        })
      ).rejects.toThrow(COAError);
    });
  });

  describe('UpdateProjectThumbnail', () => {
    const projectName = 'validProjectName';
    const countryOfImpact = 'Argentina';
    const timeframe = '12';
    const goalAmount = 124123;
    const ownerId = 2;
    const file = { name: 'project.jpeg', size: 1234 };

    beforeAll(() => {
      injectMocks(projectService, { projectDao, userDao });
    });

    it('Should update the project whenever the fields are valid and the project already exists', async () => {
      const { projectId } = await projectService.updateProjectThumbnail(1, {
        projectName,
        countryOfImpact,
        timeframe,
        goalAmount,
        ownerId,
        file
      });
      expect(projectId).toEqual(1);
    });

    it('Should not update the project whenever some fields are missing (not file since it is an optional field) and throw an error', () => {
      expect(
        projectService.updateProjectThumbnail(1, {
          projectName,
          countryOfImpact,
          timeframe,
          file
        })
      ).rejects.toThrow(COAError);
    });

    it('Should not update the project whenever the fields are valid but the project does not exist and throw an error', () => {
      expect(
        projectService.updateProjectThumbnail(2, {
          projectName,
          countryOfImpact,
          timeframe,
          goalAmount,
          ownerId,
          file
        })
      ).rejects.toThrow(COAError);
    });

    it('Should not update the project whenever the photo has an invalid file type and throw an error', () => {
      expect(
        projectService.updateProjectThumbnail(2, {
          projectName,
          countryOfImpact,
          timeframe,
          goalAmount,
          ownerId,
          file: { fileName: 'file.json', size: 1234 }
        })
      ).rejects.toThrow(COAError);
    });

    it('Should not update the project whenever the photo has an invalid size and throw an error', () => {
      expect(
        projectService.updateProjectThumbnail(2, {
          projectName,
          countryOfImpact,
          timeframe,
          goalAmount,
          ownerId,
          file: { fileName: 'file.jpeg', size: 90000000 }
        })
      ).rejects.toThrow(COAError);
    });

    it('Should update the project although file field is missing', async () => {
      const { projectId } = await projectService.updateProjectThumbnail(1, {
        projectName,
        countryOfImpact,
        timeframe,
        goalAmount,
        ownerId
      });
      expect(projectId).toEqual(1);
    });
  });
});
