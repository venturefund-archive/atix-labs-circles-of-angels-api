const apiHelper = require('../../services/helper');

module.exports = {
  deleteFile: fastify => async (request, reply) => {
    const { fileService } = apiHelper.helper.services;
    const { id } = request.params;
    fastify.log.info(`[File Routes] :: Deleting file ID ${id}`);

    try {
      const res = await fileService.deleteFile(id);

      if (res && res.error) {
        fastify.log.error(
          `[File Routes] :: Error deleting file ID ${id}:`,
          res.error
        );
        reply.status(res.status).send(res.error);
      } else {
        fastify.log.info('[File Routes] :: deleting file ID', id);

        reply.send(res);
      }
    } catch (error) {
      fastify.log.error(
        `[File Routes] :: Error deleting file ID ${id}:`,
        error
      );
      reply.status(500).send({ error: 'Error deleting file' });
    }
  }
};
