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

  fastify.get(
    `${basePath}/:projectId/getUsers`,
    {
      schema: {
        params: {
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
      const { projectId } = request.params;

      fastify.log.info(
        '[User Project Routes] :: Getting User associated to Project ID:',
        projectId
      );
      const userProjects = await userProjectService.getUsers(projectId);

      if (userProjects.error) {
        reply.status(userProjects.status).send(userProjects.error);
      } else {
        reply.send(userProjects);
      }
    }
  );
};

module.exports = routes;
