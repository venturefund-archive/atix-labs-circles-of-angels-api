const basePath = '/project';
const fileUpload = require('fastify-file-upload');
const apiHelper = require('../services/helper');

const routes = async fastify => {
  fastify.register(fileUpload);
  fastify.post(
    `${basePath}/create`,
    {
      beforeHandler: [fastify.generalAuth],
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
      const { projectService } = apiHelper.helper.services;
      fastify.log.info(
        '[Project Routes] :: POST request at /project/create:',
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

        if (response && response.error) {
          fastify.log.error(
            '[Project Routes] :: Error creating Project:',
            response.error
          );
          reply.status(response.status).send(response);
        } else if (response.milestones.errors) {
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
      beforeHandler: [fastify.adminAuth],
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
      const { projectService } = apiHelper.helper.services;
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

  fastify.get(
    `${basePath}/getActiveProjects`,
    {
      beforeHandler: [fastify.generalAuth],
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
      const { projectService } = apiHelper.helper.services;
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
      beforeHandler: [fastify.generalAuth],
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
      const { projectService } = apiHelper.helper.services;
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
      beforeHandler: [fastify.adminAuth],
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
      const { projectService } = apiHelper.helper.services;
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
        reply.status(500).send('Error updating project status');
      }
    }
  );

  fastify.post(
    `${basePath}/:projectId/deleteProject`,
    {
      beforeHandler: [fastify.adminAuth],
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
      const { projectService } = apiHelper.helper.services;
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
      beforeHandler: [fastify.generalAuth],
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
      const { projectService } = apiHelper.helper.services;
      const { oracleActivityDao } = apiHelper.helper.daos;
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
      beforeHandler: [fastify.generalAuth],
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
      const { projectService } = apiHelper.helper.services;
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
      beforeHandler: [fastify.generalAuth],
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
      const { projectService } = apiHelper.helper.services;
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
      beforeHandler: [fastify.generalAuth],
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
      const { projectService } = apiHelper.helper.services;
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
      beforeHandler: [fastify.generalAuth],
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
      const { projectService } = apiHelper.helper.services;
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
      beforeHandler: [fastify.generalAuth],
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
      const { projectService } = apiHelper.helper.services;
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
      beforeHandler: [fastify.generalAuth],
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
      const { projectService } = apiHelper.helper.services;
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
      beforeHandler: [fastify.generalAuth],
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'number' }
          }
        },
        raw: {
          type: 'object',
          properties: {
            files: {
              type: 'object',
              properties: {
                projectCoverPhoto: { type: 'object' },
                projectCardPhoto: { type: 'object' }
              },
              additionalProperties: false
            },
            body: {
              type: 'object',
              properties: {
                project: {
                  type: 'object',
                  properties: {
                    projectName: { type: 'string' },
                    mission: { type: 'string' },
                    problemAddressed: { type: 'string' },
                    location: { type: 'string' },
                    timeframe: { type: 'string' },
                    goalAmount: { type: 'number' },
                    faqLink: { type: 'string' }
                  },
                  additionalProperties: false
                }
              }
            }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'string' }
            }
          },
          '4xx': {
            type: 'object',
            properties: {
              status: { type: 'number' },
              error: { type: 'string' }
            }
          },
          500: {
            type: 'object',
            properties: {
              status: { type: 'number' },
              error: { type: 'string' }
            }
          }
        }
      }
    },
    async (req, reply) => {
      const { projectService } = apiHelper.helper.services;
      fastify.log.info(
        `[Project Routes] :: PUT request at /project/${req.params.id}:`,
        req.raw.body,
        req.raw.files
      );

      const projectCoverPhoto =
        req.raw.files && req.raw.files.projectCoverPhoto
          ? req.raw.files.projectCoverPhoto
          : undefined;

      const projectCardPhoto =
        req.raw.files && req.raw.files.projectCardPhoto
          ? req.raw.files.projectCardPhoto
          : undefined;

      const { project } = req.raw.body;
      const { id } = req.params;

      try {
        const response = await projectService.updateProject(
          project,
          projectCoverPhoto,
          projectCardPhoto,
          id
        );

        if (response.error) {
          fastify.log.error(
            '[Project Routes] :: Error updating project: ',
            response.error
          );
          reply.status(response.status).send(response);
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
      beforeHandler: [fastify.generalAuth],
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
      const { projectService } = apiHelper.helper.services;
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
      beforeHandler: [fastify.generalAuth],
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
      const { projectService } = apiHelper.helper.services;
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
      beforeHandler: [fastify.generalAuth],
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
      const { projectService } = apiHelper.helper.services;
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
