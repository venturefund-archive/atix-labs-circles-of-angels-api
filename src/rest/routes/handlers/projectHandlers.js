/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const apiHelper = require('../../services/helper');

module.exports = {
  createProject: fastify => async (req, reply) => {
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
      fastify.log.error('[Project Routes] :: Error creating project: ', error);
      reply.status(500).send({ error: 'Error creating project' });
    }
  },

  getProjects: fastify => async (request, reply) => {
    const { projectService } = apiHelper.helper.services;
    fastify.log.info('[Project Routes] :: Getting projects');
    try {
      const projects = await projectService.getProjectList();
      reply.send(projects);
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: 'Error getting projects' });
    }
  },

  getActiveProjects: fastify => async (request, reply) => {
    const { projectService } = apiHelper.helper.services;
    fastify.log.info('[Project Routes] :: Getting projects');
    try {
      const projects = await projectService.getActiveProjectList();
      reply.send(projects);
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: 'Error getting projects' });
    }
  },

  getProject: fastify => async (request, reply) => {
    const { projectService } = apiHelper.helper.services;
    const { projectId } = request.params;
    fastify.log.info(
      `[Project Routes] :: Getting project with id ${projectId}`
    );

    const project = await projectService.getProjectWithId({
      projectId
    });
    reply.send(project);
  },

  updateStatus: fastify => async (request, reply) => {
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
  },

  deleteProject: fastify => async (request, reply) => {
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
  },

  getProjectMilestones: fastify => async (request, reply) => {
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
  },

  downloadMilestonesTemplate: fastify => async (request, reply) => {
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
  },

  downloadProposalTemplate: fastify => async (request, reply) => {
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
  },

  getMilestonesFile: fastify => async (request, reply) => {
    const { projectService } = apiHelper.helper.services;
    const { projectId } = request.params;
    fastify.log.info(
      `[Project Routes] :: Getting project milestones of project ${projectId}`
    );

    try {
      const response = await projectService.getProjectMilestonesPath(projectId);
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
          .send({ error: "This project doesn't have a milestones file" });
      }
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: 'Error getting milestones file' });
    }
  },

  uploadAgreement: fastify => async (request, reply) => {
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
  },

  downloadAgreement: fastify => async (request, reply) => {
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
      fastify.log.error('[Project Routes] :: Error getting agreement:', error);
      reply.status(500).send({ error: 'Error getting agreement' });
    }
  },

  downloadProposal: fastify => async (request, reply) => {
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
  },

  updateProject: fastify => async (req, reply) => {
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
      fastify.log.error('[Project Routes] :: Error updating project: ', error);
      reply.status(500).send({ error: 'Error updating project' });
    }
  },

  getTotalFunded: fastify => async (request, reply) => {
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
      fastify.log.error('[Project Routes] :: Error updating project: ', error);
      reply.status(500).send({ error: 'Error updating project' });
    }
  },

  startProject: fastify => async (request, reply) => {
    const { projectService } = apiHelper.helper.services;
    const { id } = request.params;
    fastify.log.info(`[Project Routes] :: PUT request at /project/${id}/start`);
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
      fastify.log.error('[Project Routes] :: Error starting project: ', error);
      reply.status(500).send({ error: 'Error starting project' });
    }
  },

  getProjectsByOracle: fastify => async (request, reply) => {
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
      fastify.log.error('[Project Routes] :: Error getting projects: ', error);
      reply.status(500).send({ error: 'Error getting projects' });
    }
  },

  uploadExperience: fastify => async (request, reply) => {
    const { projectService } = apiHelper.helper.services;
    const { id } = request.params;
    const { body, files } = request.raw;
    fastify.log.info(
      `[Project Routes] :: POST request at /project/${id}/experience`,
      { body },
      { files }
    );
    try {
      const { experience } = body;
      let attachedFiles = [];
      if (files) {
        attachedFiles = Object.values(files);
      }
      const newExperience = Object.assign({}, JSON.parse(experience));

      const response = await projectService.uploadExperience(
        id,
        newExperience,
        attachedFiles
      );

      if (response.error) {
        fastify.log.error(
          '[Project Routes] :: Error uploading project experience: ',
          response
        );
        reply.status(response.status).send(response);
      } else {
        fastify.log.info(
          '[Project Routes] :: Experience uploaded successfully: ',
          response
        );
        reply.status(200).send({
          success: 'Experience uploaded successfully!',
          errors: response.errors || []
        });
      }
    } catch (error) {
      fastify.log.error(
        '[Project Routes] :: Error uploading project experience: ',
        error
      );
      reply.status(500).send({
        error: 'There was an unexpected error uploading the experience'
      });
    }
  },

  getExperiences: fastify => async (request, reply) => {
    const { projectService } = apiHelper.helper.services;
    const { id } = request.params;
    fastify.log.info(
      `[Project Routes] :: GET request at /project/${id}/experience`
    );

    try {
      const response = await projectService.getExperiences(id);

      if (response.error) {
        fastify.log.error(
          '[Project Routes] :: Error getting project experiences: ',
          response
        );
        reply.status(response.status).send(response);
      } else {
        fastify.log.info('[Project Routes] :: Project experiences: ', response);
        reply.send({ experiences: response });
      }
    } catch (error) {
      fastify.log.error(
        '[Project Routes] :: Error getting the project experiences: ',
        error
      );
      reply.status(500).send({
        error: 'There was an unexpected error getting the experiences'
      });
    }
  }
};
