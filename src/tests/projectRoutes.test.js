/**
 * COA PUBLIC LICENSE
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

describe.skip('Testing projectRoutes', () => {
  it('should return status code 200 when doing a post request to /project/upload', async () => {
    const projectRoutes = require('../rest/routes/projectRoutes');
    const fastify = require('fastify')();
    fastify.register(projectRoutes);

    const fd = new FormData();
    fd.append('projectXls', {});
    fd.append('projectCoverPhoto', {});
    fd.append('projectCardPhoto', {});
    fd.append('projectMilestones', {});

    const res = await fastify.inject({
      method: 'POST',
      url: '/project/upload',
      headers: { 'Content-Type': 'multipart/form-data' },
      data: fd
    });

    expect(res.statusCode).toBe(200);
  });
});
