const fileUpload = require('fastify-file-upload');

const basePath = '/project';
const routes = async fastify => {
  fastify.register(fileUpload);

  const activityDao = require('../dao/activityDao')(fastify.models.activity);
  const activityService = require('../core/activityService')({
    fastify,
    activityDao
  });
  const milestoneDao = require('../dao/milestoneDao')(fastify.models.milestone);
  const milestoneService = require('../core/milestoneService')({
    fastify,
    milestoneDao,
    activityService
  });
  const projectDao = require('../dao/projectDao')({
    projectModel: fastify.models.project
  });
  const projectService = require('../core/projectService')({
    fastify,
    projectDao,
    milestoneService
  });

  fastify.post(
    `${basePath}/create`,
    {
      schema: {
        type: 'multipart/form-data',
        raw: {
          files: { type: 'object' },
          body: { type: 'object' }
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
        req.raw.body,
        req.raw.files
      );

      const {
        projectProposal,
        projectCoverPhoto,
        projectCardPhoto,
        projectMilestones
      } = req.raw.files;

      const { project } = req.raw.body;

      try {
        await projectService.createProject(
          project,
          projectProposal,
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

  // ** NOT USED **
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
        await projectService.createProjectWithFile(
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
      fastify.log.info('[Project Routes] :: Getting projects');
      try {
        const projects = await projectService.getProjectList();
        reply.send(projects);
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({ error: 'Error getting projects' });
      }
    }
  );
};

module.exports = routes;
