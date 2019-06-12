/**
 * COA PUBLIC LICENSE
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

describe.skip('General routes tests', () => {
  it('shoud fetch the correct address when request', async () => {
    const fastify = require('fastify')();
    fastify.register(require('../rest/routes/generalRoutes'));

    const res = await fastify.inject({
      method: 'GET',
      url: '/general/accountDestination'
    });
  });
});
