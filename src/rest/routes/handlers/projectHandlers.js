/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

module.exports = {
  createProjectThumbnail: fastify => async (request, reply) => {
    const {
      projectName,
      countryOfImpact,
      timeframe,
      goalAmount
    } = request.raw.body;
    const { file } = request.raw.files;
    reply.send('DALE QUE VA createProjectThumbnail');
  },
  updateProjectThumbnail: fastify => async (request, reply) => {
    const { projectId } = request.params;
    const {
      projectName,
      countryOfImpact,
      timeframe,
      goalAmount
    } = request.raw.body;
    const { file } = request.raw.files;
    reply.send('DALE QUE VA updateProjectThumbnail');
  },
  getProjectThumbnail: fastify => async (request, reply) => {
    const { projectId } = request.params;
    console.log('projectId', projectId);
    reply.send('DALE QUE VA getProjectThumbnail');
  },
  createProjectDetail: fastify => async (request, reply) => {
    const { projectMission, theProblem } = request.raw.body;
    const { file } = request.raw.files;
    console.log('body', request.ray.body);
    console.log('file', file.name);
    reply.send('DALE QUE VA createProjectDetail');
  },
  updateProjectDetail: fastify => async (request, reply) => {
    const { projectId } = request.params;
    const { projectMission, theProblem } = request.raw.body;
    const { file } = request.raw.files;
    console.log('projectId', projectId);
    console.log('body', request.raw.body);
    console.log('file', file.name);
    reply.send('DALE QUE VA updateProjectDetail');
  },
  getProjectDetail: fastify => async (request, reply) => {
    const { projectId } = request.params;
    console.log('projectId', projectId);
    reply.send('DALE QUE VA getProjectDetail');
  },
  createProjectProposal: fastify => async (request, reply) => {
    const { projectProposal } = request.raw.body;
    console.log('projectProposal', projectProposal);
    reply.send('DALE QUE VA createProjectProposal');
  },
  updateProjectProposal: fastify => async (request, reply) => {
    const { projectId } = request.params;
    const { projectProposal } = request.raw.body;
    console.log('projectId', projectId);
    console.log('projectProposal', projectProposal);
    reply.send('DALE QUE VA updateProjectProposal');
  },
  getProjectProposal: fastify => async (request, reply) => {
    const { projectId } = request.params;
    console.log('projectId', projectId);
    reply.send('DALE QUE VA getProjectProposal');
  },
  deleteMilestoneOfProject: fastify => async (request, reply) => {
    const { projectId, milestoneId } = request.params;
    console.log('projectId, milestoneId', projectId, milestoneId);
    reply.send('DALE QUE VA deleteMilestoneOfProject');
  },
  editActivityOfMilestone: fastify => async (request, reply) => {
    const { milestoneId, activityId } = request.params;
    console.log('milestoneId, activityId', milestoneId, activityId);
    reply.send('DALE QUE VA editActivityOfMilestone');
  },
  deleteActivityOfMilestone: fastify => async (request, reply) => {
    const { milestoneId, activityId } = request.params;
    console.log('milestoneId, activityId', milestoneId, activityId);
    reply.send('DALE QUE VA deleteActivityOfMilestone');
  },
  addActivityOnMilestone: fastify => async (request, reply) => {
    const { milestoneId } = request.params;
    const activity = request.raw.body;
    console.log('milestoneId', milestoneId);
    reply.send('DALE QUE VA addActivityOnMilestone');
  },
  getTemplateOfProjectMilestone: fastify => async (request, reply) => {
    reply.send('DALE QUE VA getTemplateOfProjectMilestone');
  },
  uploadMilestoneFile: fastify => async (request, reply) => {
    const { projectId } = request.params;
    const { file } = request.raw.files;
    console.log('projectId', projectId);
    console.log('file name', file.name);
    reply.send('DALE QUE VA uploadMilestoneFile');
  },
  processMilestonesFile: fastify => async (request, reply) => {
    const { projectId } = request.params;
    console.log('projectId', projectId);
    reply.send('DALE QUE VA processMilestonesFile');
  },
  getProjectMilestones: fastify => async (request, reply) => {
    const { projectId } = request.params;
    console.log('projectId', projectId);
    reply.send('DALE QUE VA getProjectMilestones');
  },
  publishProject: fastify => async (request, reply) => {
    const { projectId } = request.params;
    console.log('projectId', projectId);
    reply.send('DALE QUE VA publishProject');
  }
};
