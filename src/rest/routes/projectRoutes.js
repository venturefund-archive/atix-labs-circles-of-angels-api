const fileUpload = require('fastify-file-upload');

const basePath = '/project';

const routes = async fastify => {
  fastify.register(fileUpload);
  const projectDao = require('../dao/projectDao')({
    projectModel: fastify.models.project
  });
  const projectService = require('../core/projectService')({
    fastify,
    projectDao
  });
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

  fastify.get(
    `${basePath}/getProjects`,
    {
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
      fastify.log.info(`[Project Routes] :: Getting projects`);
      try {
        const projects = await projectService.getProjectList();
        reply.send(projects);
      } catch (error) {
        fastify.log.error(error)
        reply.status(500).send({ error: 'Error getting projects' });
      }
    }
  );
};

module.exports = routes;
