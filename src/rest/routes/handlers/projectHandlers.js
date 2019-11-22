/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const apiHelper = require('../../services/helper');

module.exports = {
  createProjectThumbnail: fastify => async (request, reply) => {},
  updateProjectThumbnail: fastify => async (request, reply) => {},
  getProjectThumbnail: fastify => async (request, reply) => {},
  createProjectDetail: fastify => async (request, reply) => {},
  updateProjectDetail: fastify => async (request, reply) => {},
  getProjectDetail: fastify => async (request, reply) => {},
  createProjectProposal: fastify => async (request, reply) => {},
  updateProjectProposal: fastify => async (request, reply) => {},
  getProjectProposal: fastify => async (request, reply) => {},
  deleteMilestoneOfProject: fastify => async (request, reply) => {},
  editActivityOfMilestone: fastify => async (request, reply) => {},
  deleteActivityOfMilestone: fastify => async (request, reply) => {},
  addActivityOnMilestone: fastify => async (request, reply) => {},
  getTemplateOfProjectMilestone: fastify => async (request, reply) => {},
  uploadMilestoneFile: fastify => async (request, reply) => {},
  processMilestonesFile: fastify => async (request, reply) => {},
  getProjectMilestones: fastify => async (request, reply) => {},
  publishProject: fastify => async (request, reply) => {}
};
