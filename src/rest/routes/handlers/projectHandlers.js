/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const projectService = require('../../services/projectService');
const projectServiceExperience = require('../../services/projectExperienceService');

const { projectStatusType } = require('../../util/constants');

module.exports = {
  createProjectThumbnail: fastify => async (request, reply) => {
    const {
      projectName,
      countryOfImpact,
      timeframe,
      goalAmount
    } = request.raw.body;

    // assuming it's already logged.
    const ownerId = request.user.id;
    const { file } = request.raw.files;
    try {
      const response = await projectService.createProjectThumbnail({
        projectName,
        countryOfImpact,
        timeframe,
        goalAmount,
        file,
        ownerId
      });
      reply.status(200).send(response);
    } catch (error) {
      reply.status(error.statusCode).send(error.message);
    }
  },

  updateProjectThumbnail: fastify => async (request, reply) => {
    const { projectId } = request.params;
    const {
      projectName,
      countryOfImpact,
      timeframe,
      goalAmount
    } = request.raw.body;
    const ownerId = request.user.id;
    const file = request.raw.files ? request.raw.files.file : undefined;
    try {
      const response = await projectService.updateProjectThumbnail(projectId, {
        projectName,
        countryOfImpact,
        timeframe,
        goalAmount,
        file,
        ownerId
      });
      reply.status(200).send(response);
    } catch (error) {
      reply.status(error.statusCode).send(error.message);
    }
  },

  getProjectThumbnail: fastify => async (request, reply) => {
    const { projectId } = request.params;
    try {
      const response = await projectService.getProjectThumbnail(projectId);
      reply.status(200).send(response);
    } catch (error) {
      reply.status(error.statusCode).send(error.message);
    }
  },

  createProjectDetail: fastify => async (request, reply) => {
    const { projectMission, theProblem } = request.raw.body;
    const { file } = request.raw.files;
    const { projectId } = request.params;
    const ownerId = request.user.id;

    try {
      const response = await projectService.createProjectDetail(projectId, {
        projectMission,
        theProblem,
        file,
        ownerId
      });
      reply.status(200).send(response);
    } catch (error) {
      reply.status(error.statusCode).send(error.message);
    }
  },

  updateProjectDetail: fastify => async (request, reply) => {
    const { projectId } = request.params;
    const { projectMission, theProblem } = request.raw.body;
    const ownerId = request.user.id;
    const file = request.raw.files.file ? request.raw.files.file : undefined;
    try {
      const response = await projectService.updateProjectDetail(projectId, {
        projectMission,
        theProblem,
        file,
        ownerId
      });
      reply.status(200).send(response);
    } catch (error) {
      reply.status(error.statusCode).send(error.message);
    }
  },

  getProjectDetail: fastify => async (request, reply) => {
    const { projectId } = request.params;
    try {
      const response = await projectService.getProjectDetail(projectId);
      reply.status(200).send(response);
    } catch (error) {
      reply.status(error.statusCode).send(error.message);
    }
  },

  createProjectProposal: fastify => async (request, reply) => {
    const { projectId } = request.params;
    const ownerId = request.user.id;
    const { projectProposal } = request.raw.body;
    try {
      const response = await projectService.createProjectProposal(projectId, {
        projectProposal,
        ownerId
      });
      reply.status(200).send(response);
    } catch (error) {
      reply.status(error.statusCode).send(error.message);
    }
  },

  updateProjectProposal: fastify => async (request, reply) => {
    const ownerId = request.user.id;
    const { projectId } = request.params;
    const { projectProposal } = request.raw.body;
    try {
      const response = await projectService.updateProjectProposal(projectId, {
        projectProposal,
        ownerId
      });
      reply.status(200).send(response);
    } catch (error) {
      reply.status(error.statusCode).send(error.message);
    }
  },

  getProjectProposal: fastify => async (request, reply) => {
    const { projectId } = request.params;
    try {
      const response = await projectService.getProjectProposal(projectId);
      reply.status(200).send(response);
    } catch (error) {
      reply.status(error.statusCode).send(error.message);
    }
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

  editTaskOfMilestone: fastify => async (request, reply) => {
    const { milestoneId, taskId } = request.params;
    try {
      const response = await projectService.editTaskOfMilestone({
        milestoneId,
        taskId
      });
      reply.status(200).send(response);
    } catch (error) {
      reply.status(error.statusCode).send(error.message);
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

  uploadMilestoneFile: fastify => async (request, reply) => {
    const { projectId } = request.params;
    const { file } = request.raw.files;
    const ownerId = request.user.id;
    try {
      const response = await projectService.uploadMilestoneFile(projectId, {
        file,
        ownerId
      });
      reply.send(response);
    } catch (error) {
      reply.status(error.statusCode).send(error.message);
    }
  },

  processMilestonesFile: fastify => async (request, reply) => {
    const { projectId } = request.params;
    const ownerId = request.user.id;
    try {
      const response = await projectService.processMilestoneFile(
        projectId,
        ownerId
      );
      reply.send(response);
    } catch (error) {
      reply.status(error.statusCode).send(error.message);
    }
  },

  getProjectMilestones: fastify => async (request, reply) => {
    const { projectId } = request.params;
    try {
      const response = await projectService.getProjectMilestones(projectId);
      reply.status(200).send(response);
    } catch (error) {
      reply.status(error.statusCode).send(error.message);
    }
  },

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

  getProjects: () => async (request, reply) => {
    const projects = await projectService.getProjects();
    reply.status(200).send(projects);
  },

  getActiveProjects: fastify => async (request, reply) => {
    try {
      const projects = await projectService.getProjects({
        status: projectStatusType.ONGOING
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
