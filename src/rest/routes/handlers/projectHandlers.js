/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const projectService = require('../../services/projectService');
const projectServiceExperience = require('../../services/projectExperienceService');

const { projectStatuses } = require('../../util/constants');

module.exports = {
  createProjectThumbnail: () => async (request, reply) => {
    const body = request.raw.body || {};
    const files = request.raw.files || {};

    const { projectName, location, timeframe, goalAmount } = body;
    const ownerId = request.user.id;
    const { file } = files;
    const response = await projectService.createProjectThumbnail({
      projectName,
      location,
      timeframe,
      goalAmount,
      file,
      ownerId
    });
    reply.status(200).send(response);
  },

  updateProjectThumbnail: () => async (request, reply) => {
    const body = request.raw.body || {};
    const files = request.raw.files || {};

    const { projectId } = request.params;
    const { projectName, location, timeframe, goalAmount } = body;
    const ownerId = request.user.id;
    const { file } = files;
    const response = await projectService.updateProjectThumbnail(projectId, {
      projectName,
      location,
      timeframe,
      goalAmount,
      file,
      ownerId
    });
    reply.status(200).send(response);
  },

  getProjectThumbnail: () => async (request, reply) => {
    const { projectId } = request.params;
    const response = await projectService.getProjectThumbnail(projectId);
    reply.status(200).send(response);
  },

  createProjectDetail: () => async (request, reply) => {
    const body = request.raw.body || {};
    const files = request.raw.files || {};

    const { projectId } = request.params;
    const ownerId = request.user.id;
    const { mission, problemAddressed } = body;
    const { file } = files;
    const response = await projectService.createProjectDetail(projectId, {
      mission,
      problemAddressed,
      file,
      ownerId
    });
    reply.status(200).send(response);
  },

  updateProjectDetail: () => async (request, reply) => {
    const body = request.raw.body || {};
    const files = request.raw.files || {};

    const { projectId } = request.params;
    const ownerId = request.user.id;
    const { mission, problemAddressed } = body;
    const { file } = files;
    const response = await projectService.updateProjectDetail(projectId, {
      mission,
      problemAddressed,
      file,
      ownerId
    });
    reply.status(200).send(response);
  },

  getProjectDetail: () => async (request, reply) => {
    const { projectId } = request.params;
    const response = await projectService.getProjectDetail(projectId);
    reply.status(200).send(response);
  },

  updateProjectProposal: () => async (request, reply) => {
    const { projectId } = request.params;
    const ownerId = request.user.id;
    const { proposal } = request.body;
    const response = await projectService.updateProjectProposal(projectId, {
      proposal,
      ownerId
    });
    reply.status(200).send(response);
  },

  getProjectProposal: () => async (request, reply) => {
    const { projectId } = request.params;
    const response = await projectService.getProjectProposal(projectId);
    reply.status(200).send(response);
  },

  getMilestonesFile: () => async (request, reply) => {
    const { projectId } = request.params;
    const response = await projectService.getProjectMilestonesPath(projectId);

    reply.header('file', response.filename);
    reply.header('Access-Control-Expose-Headers', 'file');
    reply.status(200).sendFile(response.filepath);
  },

  deleteMilestoneOfProject: fastify => async (request, reply) => {
    const { projectId, milestoneId } = request.params;
    try {
      const response = await projectService.deleteMilestoneOfProject({
        projectId,
        milestoneId
      });
      reply.status(200).send(response);
    } catch (error) {
      reply.status(200).send(error.message);
    }
  },

  deleteTaskOfMilestone: fastify => async (request, reply) => {
    const { milestoneId, taskId } = request.params;
    try {
      const response = await projectService.deleteTaskOfMilestone({
        milestoneId,
        taskId
      });
      reply.status(200).send(response);
    } catch (error) {
      reply.status(error.statusCode).send(error.message);
    }
  },

  addTaskOnMilestone: fastify => async (request, reply) => {
    // TODO
    const { milestoneId } = request.params;
    const task = request.raw.body;
    reply.send('DALE QUE VA addTaskOnMilestone');
  },

  getTemplateOfProjectMilestone: fastify => async (request, reply) => {
    // TODO
    reply.send(
      'Inside getTemplateOfProjectMilestone, this should return a stream to template file, but not today :)'
    );
  },

  processMilestonesFile: () => async (request, reply) => {
    const files = request.raw.files || {};
    const { projectId } = request.params;
    const { file } = files;
    const ownerId = request.user.id;
    const response = await projectService.processMilestoneFile(projectId, {
      file,
      ownerId
    });
    reply.status(200).send(response);
  },

  getProjectMilestones: () => async (request, reply) => {
    const { projectId } = request.params;
    const response = await projectService.getProjectMilestones(projectId);
    reply.status(200).send(response);
  },

  // TODO analize if this method will be useful
  publishProject: () => async (request, reply) => {
    const { projectId } = request.params;
    const ownerId = request.user.id;

    try {
      const response = await projectService.publishProject(projectId, ownerId);
      reply.send(response);
    } catch (error) {
      reply.status(error.statusCode).send(error.message);
    }
  },

  updateProjectStatus: () => async (request, reply) => {
    const { projectId } = request.params;
    const { user } = request;
    const { status } = request.body;

    const response = await projectService.updateProjectStatus(
      user,
      projectId,
      status
    );

    reply.send(response);
  },

  getProjects: () => async (request, reply) => {
    const projects = await projectService.getProjects();
    reply.status(200).send(projects);
  },

  getActiveProjects: fastify => async (request, reply) => {
    try {
      const projects = await projectService.getProjects({
        status: projectStatuses.EXECUTING
      });
      reply.status(200).send(projects);
    } catch (error) {
      reply.status(error.statusCode).send(error.message);
    }
  },

  // FIXME --> thumbnail?
  getProjectsPreview: fastify => async (request, reply) => {},
  addExperienceToProject: fastify => async (request, reply) => {
    try {
      const userId = request.user.id;
      const { comment } = request.raw.body;
      const { files } = request.raw.files;
      const { projectId } = request.params;

      const response = await projectServiceExperience.addExperience({
        comment,
        projectId,
        userId,
        photos: files
      });
      reply.status(200).send(response);
    } catch (error) {
      reply.status(error.statusCode).send(error.message);
    }
  },
  getExperiencesOfProject: fastify => async (request, reply) => {
    try {
      const { projectId } = request.params;
      const response = await projectServiceExperience.getExperiencesOnProject({
        projectId
      });
      reply.status(200).send(response);
    } catch (error) {
      console.log('error', error);
      reply.status(error.statusCode).send(error.message);
    }
  },

  getProject: fastify => async (request, reply) => {
    const { projectId } = request.params;
    const response = await projectService.getProject(projectId);
    reply.status(200).send(response);
  },

  getProjectFull: fastify => async (request, reply) => {
    const { projectId } = request.params;
    const project = await projectService.getProjectFull(projectId);

    reply.status(200).send(project);
  }
};
