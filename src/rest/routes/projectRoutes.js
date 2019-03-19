const fileUpload = require('fastify-file-upload');

const basePath = '/project';

const routes = async fastify => {
  fastify.register(fileUpload);
  const activityDao = require('../dao/activityDao')({
    activityModel: fastify.models.activity
  });
  const activityService = require('../core/activityService')({
    fastify,
    activityDao
  });
  const milestoneDao = require('../dao/milestoneDao')({
    milestoneModel: fastify.models.project
  });
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
        //When User role verification implemented -> if Backoffice admin, get all projects, else get active projects
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
