const basePath = '/userProject';

const routes = async fastify => {
  const userProjectDao = require('../dao/userProjectDao')(
    fastify.models.user_project
  );
  const userProjectService = require('../core/userProjectService')({
    fastify,
    userProjectDao
  });

  fastify.get(
    `${basePath}/:userId/:projectId/signAgreement`,
    {
      schema: {
        params: {
          userId: { type: 'integer' },
          projectId: { type: 'integer' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            response: { type: 'object' }
          }
        }
      }
    },
    async (request, reply) => {
      fastify.log.info('[User Project Routes] :: Signing Agreement');
      const newUserProject = await userProjectService.signAgreement({
        userId: request.params.userId,
        projectId: request.params.projectId
      });

      if (newUserProject.error) {
        reply.status(newUserProject.status).send(newUserProject.error);
      } else {
        reply.send(newUserProject);
      }
    }
  );
};

module.exports = routes;
