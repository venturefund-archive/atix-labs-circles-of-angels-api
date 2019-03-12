const { assert, expect } = require('chai');

const fs = require('fs');
const { promisify } = require('util');

jest.mock('xlsx');

describe('Testing projectService', () => {
  it('should return a project object from an excel file', async () => {
    const { readProject } = require('../rest/core/projectService')();
    const readFile = promisify(fs.readFile);

    // const fastify = require('fastify')();
    // fastify.register(require('../rest/core/projectService'));

    const mockProject = {
      projectName: 'Project Name',
      mission: 'Project Mission',
      problemAddressed: 'Problem',
      location: 'Location',
      timeframe: 'Project Timeframe'
    };

    const mockXls = '/home/atixlabs/Documentos/projectXls.xlsx';
    const project = await readProject(mockXls);
    assert.deepEqual(project, mockProject);
  });
});
