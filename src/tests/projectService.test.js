const { assert } = require('chai');

const fs = require('fs');
const { promisify } = require('util');

describe('Testing projectService readProject', () => {
  const { readProject } = require('../rest/core/projectService')();

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

describe('Testing projectService createProject', () => {
  const { createProject } = require('../rest/core/projectService')();
  const readFile = promisify(fs.readFile);
  jest.mock('../rest/dao/projectDao');

  it('should create a project', async () => {
    const mockProjectXls = await readFile(
      '/home/atixlabs/Documentos/projectXls.xlsx'
    );
    const mockProjectPhoto = await readFile(
      '/home/atixlabs/Documentos/projectPhoto.png'
    );
    const mockProjectMilestones = await readFile(
      '/home/atixlabs/Documentos/projectMilestones.xlsx'
    );
  });
});
