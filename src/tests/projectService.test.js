const { assert } = require('chai');
const { createProject, readProject } = require('../rest/core/projectService')();

describe.skip('Testing projectService createProject', () => {
  const fs = require('fs');
  const { promisify } = require('util');
  const readFile = promisify(fs.readFile);
  jest.mock('../rest/dao/projectDao');

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

    const dataXls = await readFile(
      require('path').join(__dirname, './mockFiles/projectXls.xlsx')
    );

    const dataMilestones = await readFile(
      require('path').join(__dirname, './mockFiles/projectMilestones.xlsx')
    );

    const mockProjectXls = {
      name: 'projectXls.xlsx',
      data: dataXls,
      mv: jest.fn()
    };

    const mockProjectPhoto = {
      name: 'projectPhoto.xlsx',
      data: dataXls,
      mv: jest.fn()
    };

    const mockProjectMilestones = {
      name: 'projectPhoto.xlsx',
      data: dataMilestones,
      mv: jest.fn()
    };

    const project = createProject(
      mockProjectXls,
      mockProjectPhoto,
      mockProjectMilestones
    );
  });
});

describe('Testing projectService readProject', () => {
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
    const project = await readProject(mockXls);
    assert.deepEqual(project, mockProject);
  });

  it('should throw an error when file not found', async () => {
    await expect(readProject('')).rejects.toEqual(
      Error('Error reading excel file')
    );
  });
});
