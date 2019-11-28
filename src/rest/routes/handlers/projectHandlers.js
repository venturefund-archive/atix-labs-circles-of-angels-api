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
    projectService.createProjectThumbnail({
      projectName,
      countryOfImpact,
      timeframe,
      goalAmount,
      file,
      ownerId
    });
    reply.send('DALE QUE VA createProjectThumbnail');
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
    projectService.updateProjectThumbnail(projectId, {
      projectName,
      countryOfImpact,
      timeframe,
      goalAmount,
      file,
      ownerId
    });
    reply.send('DALE QUE VA updateProjectThumbnail');
  },
  getProjectThumbnail: fastify => async (request, reply) => {
    const { projectId } = request.params;
    projectService.getProjectThumbnail(projectId);
    reply.send('DALE QUE VA getProjectThumbnail');
  },
  createProjectDetail: fastify => async (request, reply) => {
    const { projectMission, theProblem, ownerId } = request.raw.body;
    const { file } = request.raw.files;
    projectService.createProjectDetail({
      projectMission,
      theProblem,
      file,
      ownerId
    });
    reply.send('DALE QUE VA createProjectDetail');
  },
  updateProjectDetail: fastify => async (request, reply) => {
    const { projectId } = request.params;
    const { projectMission, theProblem, ownerId } = request.raw.body;
    const { file } = request.raw.files;
    projectService.updateProjectDetail(projectId, {
      projectMission,
      theProblem,
      file,
      ownerId
    });
    reply.send('DALE QUE VA updateProjectDetail');
  },
  getProjectDetail: fastify => async (request, reply) => {
    const { projectId } = request.params;
    projectService.getProjectDetail(projectId);
    reply.send('DALE QUE VA getProjectDetail');
  },
  createProjectProposal: fastify => async (request, reply) => {
    const { projectProposal, ownerId } = request.raw.body;
    projectService.createProjectProposal({ projectProposal, ownerId });
    reply.send('DALE QUE VA createProjectProposal');
  },
  updateProjectProposal: fastify => async (request, reply) => {
    const { projectId } = request.params;
    const { projectProposal, ownerId } = request.raw.body;
    projectService.updateProjectProposal(projectId, {
      projectProposal,
      ownerId
    });
    reply.send('DALE QUE VA updateProjectProposal');
  },
  getProjectProposal: fastify => async (request, reply) => {
    const { projectId } = request.params;
    projectService.getProjectProposal(projectId);
    reply.send('DALE QUE VA getProjectProposal');
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
