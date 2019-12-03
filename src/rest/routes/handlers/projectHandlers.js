/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const projectService = require('../../services/projectService');
const { projectStatusType } = require('../../util/constants');

module.exports = {
  createProjectThumbnail: fastify => async (request, reply) => {
    const {
      projectName,
      countryOfImpact,
      timeframe,
      goalAmount,
      ownerId
    } = request.raw.body;
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
      reply.status(500).send(error);
    }
  },
  updateProjectThumbnail: fastify => async (request, reply) => {
    const { projectId } = request.params;
    const {
      projectName,
      countryOfImpact,
      timeframe,
      goalAmount,
      ownerId
    } = request.raw.body;
    const { file } = request.raw.files;
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
      reply.status(500).send(error);
    }
  },
  getProjectThumbnail: fastify => async (request, reply) => {
    const { projectId } = request.params;
    try {
      const response = await projectService.getProjectThumbnail(projectId);
      reply.status(200).send(response);
    } catch (error) {
      reply.status(500).send(error);
    }
  },
  createProjectDetail: fastify => async (request, reply) => {
    const { projectMission, theProblem, ownerId } = request.raw.body;
    const { file } = request.raw.files;
    try {
      const response = await projectService.createProjectDetail({
        projectMission,
        theProblem,
        file,
        ownerId
      });
      reply.status(200).send(response);
    } catch (error) {
      reply.status(500).send(error);
    }
  },
  updateProjectDetail: fastify => async (request, reply) => {
    const { projectId } = request.params;
    const { projectMission, theProblem, ownerId } = request.raw.body;
    const { file } = request.raw.files;
    try {
      const response = await projectService.updateProjectDetail(projectId, {
        projectMission,
        theProblem,
        file,
        ownerId
      });
      reply.status(200).send(response);
    } catch (error) {
      reply.status(500).send(error);
    }
  },
  getProjectDetail: fastify => async (request, reply) => {
    const { projectId } = request.params;
    try {
      const response = await projectService.getProjectDetail(projectId);
      reply.status(200).send(response);
    } catch (error) {
      reply.status(500).send(error);
    }
  },
  createProjectProposal: fastify => async (request, reply) => {
    const { projectProposal, ownerId } = request.raw.body;
    try {
      const response = await projectService.createProjectProposal({
        projectProposal,
        ownerId
      });
      reply
        .status(200)
        .send(`Project proposal added to new project with id ${response}`);
    } catch (error) {
      reply.status(500).send(error);
    }
  },
  updateProjectProposal: fastify => async (request, reply) => {
    const { projectId } = request.params;
    const { projectProposal, ownerId } = request.raw.body;
    try {
      const response = await projectService.updateProjectProposal(projectId, {
        projectProposal,
        ownerId
      });
      reply.status(200).send(response);
    } catch (error) {
      reply.status(500).send(error);
    }
  },
  getProjectProposal: fastify => async (request, reply) => {
    const { projectId } = request.params;
    try {
      const response = await projectService.getProjectProposal(projectId);
      reply.stauts(200).send(response);
    } catch (error) {
      reply.status(500).send(error);
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
      reply.status(200).send(error);
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
      reply.status(500).send(error);
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
      reply.status(500).send(error);
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
    reply.send('DALE QUE VA getTemplateOfProjectMilestone');
  },
  uploadMilestoneFile: fastify => async (request, reply) => {
    const { projectId } = request.params;
    const { file } = request.raw.files;
    try {
      const response = await projectService.uploadMilestoneFile(
        projectId,
        file
      );
      reply.send(response);
    } catch (error) {
      reply.status(500).send(error);
    }
  },
  processMilestonesFile: fastify => async (request, reply) => {
    const { projectId } = request.params;
    try {
      const response = await projectService.processMilestoneFile(projectId);
      reply.send(response);
    } catch (error) {
      reply.status(500).send(error);
    }
  },
  getProjectMilestones: fastify => async (request, reply) => {
    const { projectId } = request.params;
    try {
      const response = await projectService.getProjectMilestones(projectId);
      console.log('response', response);
      reply.status(200).send(response);
    } catch (error) {
      reply.status(500).send(error);
    }
  },
  publishProject: fastify => async (request, reply) => {
    const { projectId } = request.params;
    try {
      const response = await projectService.publishProject(projectId);
      reply.send(response);
    } catch (error) {
      reply.status(500).send(error);
    }
  },

  getProjects: fastify => async (request, reply) => {
    try {
      const projects = await projectService.getProjects();
      reply.status(200).send(projects);
    } catch (error) {
      reply.status(500).send(error);
    }
  },

  getActiveProjects: fastify => async (request, reply) => {
    try {
      const projects = await projectService.getProjects({
        status: projectStatusType.ONGOING
      });
      reply.status(200).send(projects);
    } catch (error) {
      reply.status(500).send(error);
    }
  },

  // FIXME --> thumbnail?
  getProjectsPreview: fastify => async (request, reply) => {}
};
