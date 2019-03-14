const fileUpload = require('fastify-file-upload');

const basePath = '/project';

const routes = async fastify => {
  fastify.register(fileUpload);
  const projectService = require('../core/projectService')();

  fastify.post(
    `${basePath}/upload`,
    {
      schema: {
        type: 'multipart/form-data',
        raw: {
          files: { type: 'object' }
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
    async (req, reply) => {
      fastify.log.info(
        '[Project Routes] :: POST request at /project/upload:',
        req
      );

      const { projectXls, projectPhoto, projectMilestones } = req.raw.files;

      try {
        await projectService.createProject(
          projectXls,
          projectPhoto,
          projectMilestones
        );
      } catch (error) {
        fastify.log.error(
          '[Project Routes] :: Error creating project: ',
          error
        );
        reply.status(500).send({ error: 'Error creating project' });
      }

      reply.send({ sucess: 'Project created successfully!' });
    }
  );
};

module.exports = routes;
