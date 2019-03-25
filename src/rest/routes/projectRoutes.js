const fileUpload = require('fastify-file-upload');
const { addPathToFilesProperties } = require('../util/files');

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
  const userDao = require('../dao/userDao')({ userModel: fastify.models.user });
  const projectDao = require('../dao/projectDao')({
    projectModel: fastify.models.project,
    userDao
  });
  const projectStatusDao = require('../dao/projectStatusDao')({
    projectStatusModel: fastify.models.project_status
  });
  const projectService = require('../core/projectService')({
    fastify,
    projectDao,
    milestoneService,
    projectStatusDao
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

      addPathToFilesProperties(
        project,
        projectProposal,
        projectCoverPhoto,
        projectCardPhoto,
        projectMilestones
      );

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
        // When User role verification implemented ->
        // if Backoffice admin, get all projects, else get active projects
        const projects = await projectService.getProjectList();
        reply.send(projects);
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({ error: 'Error getting projects' });
      }
    }
  );

  fastify.get(
    `${basePath}/:projectId/getProject`,
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
        `[Project Routes] :: Getting project with id ${projectId}`
      );

      const project = await projectService.getProjectWithId({
        projectId
      });
      reply.send(project);
    }
  );

  fastify.post(
    `${basePath}/:projectId/updateStatus`,
    {
      schema: {
        type: 'application/json',
        body: {
          status: { type: 'int' }
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
      fastify.log.info('[Project Routes] :: update status project');
      const { projectId } = request.params;
      const { status } = request.body;
      try {
        const response = await projectService.updateProjectStatus({
          projectId,
          status
        });
        reply.status(200).send(response);
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({ error: 'Error updateing project status' });
      }
    }
  );

  fastify.post(
    `${basePath}/:projectId/deleteProject`,
    {
      schema: {
        params: {
          projectId: { type: 'integer' }
        },
        type: 'application/json'
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
      fastify.log.info('[Project Routes] :: deleteing project');
      const { projectId } = request.params;
      try {
        const response = await projectService.deleteProject({
          projectId
        });
        reply.status(200).send(response);
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({ error: 'Error deleteing project' });
      }
    }
  );

  fastify.get(
    `${basePath}/:projectId/getMilestones`,
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
        `[Project Routes] :: Getting project milestones of project ${projectId}`
      );

      try {
        const milestones = await projectService.getProjectMilestones({
          projectId
        });
        reply.status(200).send(milestones);
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({ error: 'Error getting milestones' });
      }
    }
  );

  fastify.get(
    `${basePath}/downloadMilestonesTemplate`,
    {
      schema: {
        params: {
          projectId: { type: 'number' }
        }
      },
      response: {
        200: {
          type: 'application/octet-stream',
          properties: {
            response: { type: 'application/octet-stream' }
          }
        }
      }
    },
    async (request, reply) => {
      fastify.log.info(
        '[Project Routes] :: Downloading milestones template file'
      );
      try {
        const res = await projectService.downloadMilestonesTemplate();

        if (res && res.error) {
          fastify.log.error(
            '[Project Routes] :: Error getting milestones template:',
            res.error
          );
          reply.status(res.status).send(res.error);
        } else {
          fastify.log.info(
            '[Project Routes] :: Milestones template downloaded:',
            res
          );
          reply.send(res);
        }
      } catch (error) {
        fastify.log.error(
          '[Project Routes] :: Error getting milestones template:',
          error
        );
        reply.status(500).send({ error: 'Error getting milestones template' });
      }
    }
  );
  fastify.get(
    `${basePath}/:projectId/getMilestonesFile`,
    {
      schema: {
        params: {
          projectId: { type: 'integer' }
        }
      },
      response: {
        200: {
          type: 'application/octet-stream',
          properties: {
            response: { type: 'application/octet-stream' }
          }
        }
      }
    },
    async (request, reply) => {
      const { projectId } = request.params;
      fastify.log.info(
        `[Project Routes] :: Getting project milestones of project ${projectId}`
      );

      try {
        const milestonesFilePath = await projectService.getProjectMilestonesPath(
          projectId
        );
        reply.status(200).sendFile(milestonesFilePath);
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({ error: 'Error getting milestones file' });
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

  fastify.get(
    `${basePath}/:projectId/downloadAgreement`,
    {
      schema: {
        type: 'multipart/form-data',
        params: {
          projectId: { type: 'number' }
        }
      },
      response: {
        200: {
          type: 'application/octet-stream',
          properties: {
            response: { type: 'application/octet-stream' }
          }
        }
      }
    },
    async (request, reply) => {
      fastify.log.info('[Project Routes] :: Downloading agreement file');
      try {
        const res = await projectService.downloadAgreement(
          request.params.projectId
        );

        if (res && res.error) {
          fastify.log.error(
            '[Project Routes] :: Error getting agreement:',
            res.error
          );
          reply.status(res.status).send(res.error);
        } else {
          fastify.log.info(
            '[Project Routes] :: Project agreement downloaded:',
            res
          );
          reply.send(res);
        }
      } catch (error) {
        fastify.log.error(

          '[Project Routes] :: Error getting agreement:',
          error
        );
        reply.status(500).send({ error: 'Error getting agreement' });
      }
    }
  );

  fastify.get(
    `${basePath}/:projectId/downloadProposal`,
    {
      schema: {
        params: {
          projectId: { type: 'number' }
        }
      },
      response: {
        200: {
          type: 'application/octet-stream',
          properties: {
            response: { type: 'application/octet-stream' }
          }
        }
      }
    },
    async (request, reply) => {
      fastify.log.info('[Project Routes] :: Downloading proposal file');
      try {
        const res = await projectService.downloadProposal(
          request.params.projectId
        );

        if (res && res.error) {
          fastify.log.error(
            '[Project Routes] :: Error getting proposal:',
            res.error
          );
          reply.status(res.status).send(res.error);
        } else {
          fastify.log.info(
            '[Project Routes] :: Project proposal downloaded:',
            res
          );
          reply.send(res);
        }
      } catch (error) {
        fastify.log.error('[Project Routes] :: Error getting proposal:', error);
        reply.status(500).send({ error: 'Error getting proposal' });
      }
    }
  );
};

module.exports = routes;
