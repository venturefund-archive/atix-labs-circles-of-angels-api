const errors = require('../rest/errors/exporter/ErrorExporter');
const COAError = require('../rest/errors/COAError');

const { injectMocks } = require('../rest/util/injection');

const projectService = require('../rest/services/projectService');

describe('Project Service Test', () => {
  describe('Update project', () => {
    beforeAll(() => {
      const projectDao = {
        updateProject: (fields, projectId) => {
          if (projectId === 1) {
            return {
              projectName: 'projectUpdateado',
              ...fields,
              id: projectId
            };
          }
          return undefined;
        }
      };
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

  describe('Save project', () => {});
});
