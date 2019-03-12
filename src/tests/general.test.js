const { assert, expect } = require('chai');

describe('General routes tests', () => {
  it('shoud fetch the correct address when request', async () => {
    const fastify = require('fastify')();
    fastify.register(require('../rest/routes/generalRoutes'));

    const res = await fastify.inject({
      method: 'GET',
      url: '/general/accountDestination'
    });
  });
});
