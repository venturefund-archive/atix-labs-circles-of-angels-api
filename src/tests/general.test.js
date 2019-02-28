const { assert, expect } = require("chai");

describe("General routes tests", async () => {
  it("shoud fetch the correct address when request", async () => {
    const fastify = require("fastify")();
    fastify.register(require("../rest/routes/generalRoutes").default);

    const res = await fastify.inject({
      method: "GET",
      url: "/general/accountDestination"
    });
  });
});
