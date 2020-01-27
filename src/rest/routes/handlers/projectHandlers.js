/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const { coa } = require('@nomiclabs/buidler');

const projectService = require('../../services/projectService');
const projectServiceExperience = require('../../services/projectExperienceService');

const { projectStatuses, supporterRoles } = require('../../util/constants');

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

  sendToReview: () => async (request, reply) => {
    const { projectId } = request.params;
    const { user } = request;
    const response = await projectService.updateProjectStatus(
      user,
      projectId,
      projectStatuses.TO_REVIEW
    );
    reply.send(response);
  },

  // TODO: separate this into different handlers per status
  //       or make it receive the status from the route.
  //       either way, I don't think the status should come in the body
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

  getPublicProjects: () => async (request, reply) => {
    const projects = await projectService.getPublicProjects();
    reply.status(200).send(projects);
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
  },

  getProjectUsers: () => async (request, reply) => {
    const { projectId } = request.params;
    const users = await projectService.getProjectUsers(projectId);
    reply.status(200).send(users);
  },

  followProject: () => async (request, reply) => {
    const { projectId } = request.params;
    const userId = request.user.id;
    const response = await projectService.followProject({ projectId, userId });
    reply.status(200).send(response);
  },

  unfollowProject: () => async (request, reply) => {
    const { projectId } = request.params;
    const userId = request.user.id;

    const response = await projectService.unfollowProject({
      projectId,
      userId
    });

    reply.status(200).send(response);
  },

  isFollower: () => async (request, reply) => {
    const { projectId } = request.params;
    const userId = request.user.id;
    const response = await projectService.isFollower({ projectId, userId });
    reply.status(200).send(response);
  },

  applyAsOracle: () => async (request, reply) => {
    const { projectId } = request.params;
    const userId = request.user.id;
    const response = await projectService.applyToProject({
      projectId,
      userId,
      role: supporterRoles.ORACLES
    });

    reply.status(200).send(response);
  },

  applyAsFunder: () => async (request, reply) => {
    const { projectId } = request.params;
    const userId = request.user.id;
    const response = await projectService.applyToProject({
      projectId,
      userId,
      role: supporterRoles.FUNDERS
    });

    reply.status(200).send(response);
  },

  isCandidate: () => async (request, reply) => {
    const { projectId } = request.params;
    const userId = request.user.id;
    const response = await projectService.isCandidate({ projectId, userId });
    reply.status(200).send(response);
  }
};
