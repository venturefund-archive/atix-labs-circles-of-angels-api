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
      fastify.log.info(
        '[Project Routes] :: POST request at /project/upload:',
        req
      );

      const {
        projectXls,
        projectCoverPhoto,
        projectCardPhoto,
        projectMilestones
      } = req.raw.files;

      try {
        await projectService.createProject(
          projectXls,
          projectCoverPhoto,
          projectCardPhoto,
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

  fastify.post(
    `${basePath}/:projectId/uploadAgreement`,
    {
      schema: {
        type: 'multipart/form-data',
        params: {
          projectId: { type: 'number' }
        },
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
    async (request, reply) => {
      fastify.log.info('[Project Routes] :: Uploading agreement file');
      try {
        const { projectAgreement } = request.raw.files;

        const res = await projectService.uploadAgreement(
          projectAgreement,
          request.params.projectId
        );

        if (res && res.error) {
          fastify.log.error(
            '[Project Routes] :: Error uploading agreement:',
            res.error
          );
          reply.status(res.status).send(res.error);
        } else {
          fastify.log.info(
            '[Project Routes] :: Project agreement uploaded:',
            res
          );
          reply.status(200).send('Project agreement successfully uploaded!');
        }
      } catch (error) {
        fastify.log.error(
          '[Project Routes] :: Error uploading agreement:',
          error
        );
        reply.status(500).send({ error: 'Error uploading agreement' });
      }
    }
  );
};

module.exports = routes;
