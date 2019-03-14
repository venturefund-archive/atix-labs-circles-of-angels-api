const { assert } = require('chai');
const projectRoutes = require('../rest/routes/projectRoutes');

describe.skip('Testing projectRoutes', () => {
  it('should return status code 200 when doing a post request to /project/upload', async () => {
    const fastify = require('fastify')();
    fastify.register(projectRoutes);

    const fd = new FormData();
    fd.append('projectXls', 'file1');
    fd.append('projectPhoto', 'file2');
    fd.append('projectMilestones', 'file3');

    fastify.inject(
      {
        method: 'POST',
        url: '/project/upload',
        headers: { 'Content-Type': 'multipart/form-data' },
        data: fd
      },
      (err, res) => {
        assert.equal(res.statusCode, 200);
      }
    );
  });
});
