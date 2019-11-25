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
    console.log('projectId', projectId);
    projectService.getProjectThumbnail(projectId);
    reply.send('DALE QUE VA getProjectThumbnail');
  },
  createProjectDetail: fastify => async (request, reply) => {
    const { projectMission, theProblem, ownerId } = request.raw.body;
    const { file } = request.raw.files;
    console.log('body', request.raw.body);
    console.log('file', file.name);
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
    console.log('projectId', projectId);
    console.log('body', request.raw.body);
    console.log('file', file.name);
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
    console.log('projectId', projectId);
    projectService.getProjectDetail(projectId);
    reply.send('DALE QUE VA getProjectDetail');
  },
  createProjectProposal: fastify => async (request, reply) => {
    const { projectProposal, ownerId } = request.raw.body;
    console.log('projectProposal', projectProposal);
    projectService.createProjectProposal({ projectProposal, ownerId });
    reply.send('DALE QUE VA createProjectProposal');
  },
  updateProjectProposal: fastify => async (request, reply) => {
    const { projectId } = request.params;
    const { projectProposal, ownerId } = request.raw.body;
    console.log('projectId', projectId);
    console.log('projectProposal', projectProposal);
    projectService.updateProjectProposal(projectId, {
      projectProposal,
      ownerId
    });
    reply.send('DALE QUE VA updateProjectProposal');
  },
  getProjectProposal: fastify => async (request, reply) => {
    const { projectId } = request.params;
    console.log('projectId', projectId);
    projectService.getProjectProposal(projectId);
    reply.send('DALE QUE VA getProjectProposal');
  },
  deleteMilestoneOfProject: fastify => async (request, reply) => {
    const { projectId, milestoneId } = request.params;
    console.log('projectId, milestoneId', projectId, milestoneId);
    projectService.deleteMilestoneOfProject({ projectId, milestoneId });
    reply.send('DALE QUE VA deleteMilestoneOfProject');
  },
  editTaskOfMilestone: fastify => async (request, reply) => {
    const { milestoneId, taskId } = request.params;
    console.log('milestoneId, taskId', milestoneId, taskId);
    projectService.editTaskOfMilestone({ milestoneId, taskId });
    reply.send('DALE QUE VA editTaskOfMilestone');
  },
  deleteTaskOfMilestone: fastify => async (request, reply) => {
    const { milestoneId, taskId } = request.params;
    console.log('milestoneId, taskId', milestoneId, taskId);
    projectService.deleteTaskOfMilestone({ milestoneId, taskId });
    reply.send('DALE QUE VA deleteTaskOfMilestone');
  },
  addTaskOnMilestone: fastify => async (request, reply) => {
    // TODO
    const { milestoneId } = request.params;
    const task = request.raw.body;
    console.log('milestoneId', milestoneId);
    reply.send('DALE QUE VA addTaskOnMilestone');
  },
  getTemplateOfProjectMilestone: fastify => async (request, reply) => {
    // TODO
    reply.send('DALE QUE VA getTemplateOfProjectMilestone');
  },
  uploadMilestoneFile: fastify => async (request, reply) => {
    const { projectId } = request.params;
    const { file } = request.raw.files;
    console.log('projectId', projectId);
    console.log('file name', file.name);
    projectService.uploadMilestoneFile(projectId, file);
    reply.send('DALE QUE VA uploadMilestoneFile');
  },
  processMilestonesFile: fastify => async (request, reply) => {
    const { projectId } = request.params;
    console.log('projectId', projectId);
    projectService.processMilestoneFile(projectId);
    reply.send('DALE QUE VA processMilestonesFile');
  },
  getProjectMilestones: fastify => async (request, reply) => {
    const { projectId } = request.params;
    console.log('projectId', projectId);
    projectService.getProjectMilestones(projectId);
    reply.send('DALE QUE VA getProjectMilestones');
  },
  publishProject: fastify => async (request, reply) => {
    const { projectId } = request.params;
    console.log('projectId', projectId);
    projectService.publishProject(projectId);
    reply.send('DALE QUE VA publishProject');
  },

  // FIXME
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

  // FIXME
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

  // FIXME
  getProjectsPreview: fastify => async (request, reply) => {
    const { projectService } = apiHelper.helper.services;
    fastify.log.info('[Project Routes] :: Getting preview of projects');
    try {
      const projects = await projectService.getProjectsPreview();
      reply.send(projects);
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: 'Error getting projects' });
    }
  }
};
