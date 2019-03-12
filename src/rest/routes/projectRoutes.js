const fileUpload = require('fastify-file-upload');
const projectService = require('../core/projectService')();

const basePath = '/project';

const routes = async (fastify, options) => {
  fastify.register(fileUpload);

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
