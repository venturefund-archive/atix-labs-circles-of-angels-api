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

  fastify.get(
    `${basePath}/:userId/:projectId/create`,
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
      const { userId, projectId } = request.params;

      fastify.log.info(
        `[User Project Routes] :: Associating User ID ${userId} to Project ID 
        ${projectId}`
      );

      try {
        const userProject = await userProjectService.createUserProject(
          userId,
          projectId
        );

        if (userProject.error) {
          fastify.log.error(
            '[User Project Routes] :: Error creating user-project relation: ',
            userProject.error
          );
          reply.status(userProject.status).send(userProject.error);
        } else {
          fastify.log.info(
            '[User Routes Service] :: User-Project relation created succesfully: ',
            userProject
          );
          reply
            .status(200)
            .send({ success: 'User-project relation created successfully!' });
        }
      } catch (error) {
        fastify.log.error(
          '[User Project Routes] :: Error creating user-project relation: ',
          error
        );
        reply
          .status(500)
          .send({ error: 'Error creating user-project relation' });
      }
    }
  );
};

module.exports = routes;
