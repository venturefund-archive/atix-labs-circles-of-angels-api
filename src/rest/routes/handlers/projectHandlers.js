/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const projectService = require('../../services/projectService');

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
    const response = projectService.createProjectThumbnail({
      projectName,
      countryOfImpact,
      timeframe,
      goalAmount,
      file,
      ownerId
    });
    reply.send(
      `Project thumbnail addded to new project with projectId ${response}`
    );
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
    const response = projectService.updateProjectThumbnail(projectId, {
      projectName,
      countryOfImpact,
      timeframe,
      goalAmount,
      file,
      ownerId
    });
    reply.send(`Project thumbnail updated of project with id ${response}`);
  },
  getProjectThumbnail: fastify => async (request, reply) => {
    const { projectId } = request.params;
    const response = projectService.getProjectThumbnail(projectId);
    reply.send(response);
  },
  createProjectDetail: fastify => async (request, reply) => {
    const { projectMission, theProblem, ownerId } = request.raw.body;
    const { file } = request.raw.files;
    const response = projectService.createProjectDetail({
      projectMission,
      theProblem,
      file,
      ownerId
    });
    reply.send(`Project detail added to new project with id ${response}`);
  },
  updateProjectDetail: fastify => async (request, reply) => {
    const { projectId } = request.params;
    const { projectMission, theProblem, ownerId } = request.raw.body;
    const { file } = request.raw.files;
    const response = projectService.updateProjectDetail(projectId, {
      projectMission,
      theProblem,
      file,
      ownerId
    });
    reply.send(`Project detail updated of project with id ${response}`);
  },
  getProjectDetail: fastify => async (request, reply) => {
    const { projectId } = request.params;
    const response = projectService.getProjectDetail(projectId);
    reply.send(response);
  },
  createProjectProposal: fastify => async (request, reply) => {
    const { projectProposal, ownerId } = request.raw.body;
    const response = projectService.createProjectProposal({
      projectProposal,
      ownerId
    });
    reply.send(`Project proposal added to new project with id ${response}`);
  },
  updateProjectProposal: fastify => async (request, reply) => {
    const { projectId } = request.params;
    const { projectProposal, ownerId } = request.raw.body;
    const response = projectService.updateProjectProposal(projectId, {
      projectProposal,
      ownerId
    });
    reply.send(`Project proposal updated of project with id ${response}`);
  },
  getProjectProposal: fastify => async (request, reply) => {
    const { projectId } = request.params;
    const response = projectService.getProjectProposal(projectId);
    reply.send(response);
  },
  deleteMilestoneOfProject: fastify => async (request, reply) => {
    const { projectId, milestoneId } = request.params;
    projectService.deleteMilestoneOfProject({ projectId, milestoneId });
    reply.send('DALE QUE VA deleteMilestoneOfProject');
  },
  editTaskOfMilestone: fastify => async (request, reply) => {
    const { milestoneId, taskId } = request.params;
    projectService.editTaskOfMilestone({ milestoneId, taskId });
    reply.send('DALE QUE VA editTaskOfMilestone');
  },
  deleteTaskOfMilestone: fastify => async (request, reply) => {
    const { milestoneId, taskId } = request.params;
    projectService.deleteTaskOfMilestone({ milestoneId, taskId });
    reply.send('DALE QUE VA deleteTaskOfMilestone');
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
    projectService.uploadMilestoneFile(projectId, file);
    reply.send('DALE QUE VA uploadMilestoneFile');
  },
  processMilestonesFile: fastify => async (request, reply) => {
    const { projectId } = request.params;
    projectService.processMilestoneFile(projectId);
    reply.send('DALE QUE VA processMilestonesFile');
  },
  getProjectMilestones: fastify => async (request, reply) => {
    const { projectId } = request.params;
    projectService.getProjectMilestones(projectId);
    reply.send('DALE QUE VA getProjectMilestones');
  },
  publishProject: fastify => async (request, reply) => {
    const { projectId } = request.params;
    projectService.publishProject(projectId);
    reply.send('DALE QUE VA publishProject');
  },

  // FIXME
  getProjects: fastify => async (request, reply) => {
    const projects = projectService.getProjects();
  },

  // FIXME
  getActiveProjects: fastify => async (request, reply) => {},

  // FIXME
  getProjectsPreview: fastify => async (request, reply) => {}
};
