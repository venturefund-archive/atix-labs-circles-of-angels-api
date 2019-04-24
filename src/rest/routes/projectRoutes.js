const fileUpload = require('fastify-file-upload');
const fileDaoBuilder = require('../dao/fileDao');
const fileServiceBuilder = require('../core/fileService');
const photoDaoBuilder = require('../dao/photoDao');
const photoServiceBuilder = require('../core/photoService');
const activityFileDaoBuilder = require('../dao/activityFileDao');
const activityPhotoDaoBuilder = require('../dao/activityPhotoDao');
const activityDaoBuilder = require('../dao/activityDao');
const oracleActivityDaoBuilder = require('../dao/oracleActivityDao');
const activityServiceBuilder = require('../core/activityService');
const milestoneDaoBuilder = require('../dao/milestoneDao');
const milestoneServiceBuilder = require('../core/milestoneService');
const userDaoBuilder = require('../dao/userDao');
const projectDaoBuilder = require('../dao/projectDao');
const projectStatusDaoBuilder = require('../dao/projectStatusDao');
const projectServiceBuilder = require('../core/projectService');
const transferDaoBuilder = require('../dao/transferDao');
const transferServiceBuilder = require('../core/transferService');

const basePath = '/project';
const routes = async fastify => {
  fastify.register(fileUpload);

  const fileService = fileServiceBuilder({
    fastify,
    fileDao: fileDaoBuilder(fastify.models.file)
  });
  const photoService = photoServiceBuilder({
    fastify,
    photoDao: photoDaoBuilder(fastify.models.photo)
  });
  const oracleActivityDao = oracleActivityDaoBuilder(
    fastify.models.oracle_activity
  );
  const activityService = activityServiceBuilder({
    fastify,
    activityDao: activityDaoBuilder(fastify.models.activity),
    fileService,
    photoService,
    activityFileDao: activityFileDaoBuilder(fastify.models.activity_file),
    activityPhotoDao: activityPhotoDaoBuilder(fastify.models.activity_photo),
    oracleActivityDao
  });
  const milestoneService = milestoneServiceBuilder({
    fastify,
    milestoneDao: milestoneDaoBuilder(fastify.models.milestone),
    activityService
  });

  const transferService = transferServiceBuilder({
    fastify,
    transferDao: transferDaoBuilder({
      transferModel: fastify.models.fund_transfer,
      transferStatusModel: fastify.models.transfer_status
    })
  });

  const projectService = projectServiceBuilder({
    fastify,
    projectDao: projectDaoBuilder({
      projectModel: fastify.models.project,
      userDao: userDaoBuilder({ userModel: fastify.models.user })
    }),
    milestoneService,
    projectStatusDao: projectStatusDaoBuilder({
      projectStatusModel: fastify.models.project_status
    }),
    photoService,
    transferService
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
        projectMilestones,
        projectAgreement
      } = req.raw.files;

      const { project, ownerId } = req.raw.body;

      try {
        const response = await projectService.createProject(
          project,
          projectProposal,
          projectCoverPhoto,
          projectCardPhoto,
          projectMilestones,
          projectAgreement,
          ownerId
        );

        if (response.milestones.errors) {
          await projectService.deleteProject({
            projectId: response.project.id
          });
          fastify.log.info(
            '[Project Routes] :: Deleting project ID: ',
            response.project.id
          );
          reply.status(409).send({ errors: response.milestones.errors });
        } else {
          fastify.log.info(
            '[Project Routes] :: Project created: ',
            response.project
          );
          reply.send({ sucess: 'Project created successfully!' });
        }
      } catch (error) {
        fastify.log.error(
          '[Project Routes] :: Error creating project: ',
          error
        );
        reply.status(500).send({ error: 'Error creating project' });
      }
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
    `${basePath}/getActiveProjects`,
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
        const projects = await projectService.getActiveProjectList();
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
        const milestones = await projectService.getProjectMilestones(
          projectId,
          oracleActivityDao
        );
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

          reply.header('file', res.filename);
          reply.header('Access-Control-Expose-Headers', 'file');
          reply.send(res.filestream);
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
    `${basePath}/proposalTemplate`,
    {
      schema: {
        response: {
          200: {
            type: 'object',
            properties: {
              response: { type: 'object' }
            }
          }
        }
      }
    },
    async (request, reply) => {
      fastify.log.info(
        '[Project Routes] :: Downloading project proposal template file'
      );
      try {
        const res = await projectService.downloadProposalTemplate();

        if (res && res.error) {
          fastify.log.error(
            '[Project Routes] :: Error getting project proposal template:',
            res.error
          );
          reply.status(res.status).send(res.error);
        } else {
          fastify.log.info(
            '[Project Routes] :: Project proposal template downloaded:',
            res
          );

          reply.header('file', res.filename);
          reply.header('Access-Control-Expose-Headers', 'file');
          reply.send(res.filestream);
        }
      } catch (error) {
        fastify.log.error(
          '[Project Routes] :: Error getting project proposal template:',
          error
        );
        reply
          .status(500)
          .send({ error: 'Error getting  project proposal template' });
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
        const response = await projectService.getProjectMilestonesPath(
          projectId
        );
        if (
          response.filepath &&
          response.filepath !== '' &&
          response.filepath != null
        ) {
          reply.header('file', response.filename);
          reply.header('Access-Control-Expose-Headers', 'file');
          reply.status(200).sendFile(response.filepath);
        } else {
          reply
            .status(500)
            // eslint-disable-next-line prettier/prettier
            .send({ error: "This project doesn't have a milestones file" });
        }
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
          reply
            .status(200)
            .send({ success: 'Project agreement successfully uploaded!' });
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
          reply.header('file', res.filename);
          reply.header('Access-Control-Expose-Headers', 'file');
          reply.send(res.filestream);
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
          reply.header('file', res.filename);
          reply.header('Access-Control-Expose-Headers', 'file');
          reply.send(res.filestream);
        }
      } catch (error) {
        fastify.log.error('[Project Routes] :: Error getting proposal:', error);
        reply.status(500).send({ error: 'Error getting proposal' });
      }
    }
  );

  fastify.put(
    `${basePath}/:id`,
    {
      schema: {
        type: 'multipart/form-data',
        params: {
          id: { type: 'number' }
        },
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
        `[Project Routes] :: PUT request at /project/${req.params.id}:`,
        req.raw.body,
        req.raw.files
      );

      const {
        projectProposal,
        projectCoverPhoto,
        projectCardPhoto
      } = req.raw.files;
      const { project } = req.raw.body;
      const { id } = req.params;

      try {
        const response = await projectService.updateProject(
          project,
          projectProposal,
          projectCoverPhoto,
          projectCardPhoto,
          id
        );

        if (response.error) {
          fastify.log.error(
            '[Project Routes] :: Error updating project: ',
            response.error
          );
          reply.status(response.status).send(response.error);
        } else {
          reply.send({ success: 'Project updated successfully!' });
        }
      } catch (error) {
        fastify.log.error(
          '[Project Routes] :: Error updating project: ',
          error
        );
        reply.status(500).send({ error: 'Error updating project' });
      }
    }
  );

  fastify.get(
    `${basePath}/:id/alreadyFunded`,
    {
      schema: {
        params: {
          id: { type: 'number' }
        }
      },
      response: {
        200: { type: 'number' }
      }
    },
    async (request, reply) => {
      const { id } = request.params;
      fastify.log.info(
        `[Project Routes] :: GET request at /project/${id}/alreadyFunded`
      );
      try {
        const fundedAmount = await projectService.getTotalFunded(id);

        if (fundedAmount.error) {
          fastify.log.error(
            '[Project Routes] :: Error getting total funded amount:',
            fundedAmount.error
          );
          reply.status(fundedAmount.status).send(fundedAmount.error);
        } else {
          reply.status(200).send(fundedAmount);
        }
      } catch (error) {
        fastify.log.error(
          '[Project Routes] :: Error updating project: ',
          error
        );
        reply.status(500).send({ error: 'Error updating project' });
      }
    }
  );

  fastify.put(
    `${basePath}/:id/start`,
    {
      schema: {
        params: {
          id: { type: 'number' }
        }
      },
      response: {
        200: { type: 'number' }
      }
    },
    async (request, reply) => {
      const { id } = request.params;
      fastify.log.info(
        `[Project Routes] :: PUT request at /project/${id}/start`
      );
      try {
        const startedProject = await projectService.startProject(id);

        if (startedProject.error) {
          fastify.log.error(
            '[Project Routes] :: Error starting project:',
            startedProject.error
          );
          reply
            .status(startedProject.status)
            .send({ error: startedProject.error });
        } else {
          reply.status(200).send({ success: 'Project started successfully!' });
        }
      } catch (error) {
        fastify.log.error(
          '[Project Routes] :: Error starting project: ',
          error
        );
        reply.status(500).send({ error: 'Error starting project' });
      }
    }
  );

  fastify.get(
    `${basePath}/oracle/:id`,
    {
      schema: {
        params: {
          id: { type: 'number' }
        }
      },
      response: {
        200: { type: 'number' }
      }
    },
    async (request, reply) => {
      const { id } = request.params;
      fastify.log.info(
        `[Project Routes] :: GET request at /project/oracle/${id}`
      );
      try {
        const projects = await projectService.getProjectsAsOracle(id);

        if (projects.error) {
          fastify.log.error(
            '[Project Routes] :: Error getting projects:',
            projects.error
          );
          reply.status(projects.status).send(projects.error);
        } else {
          reply.status(200).send(projects);
        }
      } catch (error) {
        fastify.log.error(
          '[Project Routes] :: Error getting projects: ',
          error
        );
        reply.status(500).send({ error: 'Error getting projects' });
      }
    }
  );
};

module.exports = routes;
